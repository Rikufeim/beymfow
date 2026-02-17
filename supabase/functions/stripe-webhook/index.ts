import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

function computePlan(status: string): string {
  return (status === 'active' || status === 'trialing') ? 'pro' : 'free';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      logStep("Signature verification failed", { error: err instanceof Error ? err.message : err });
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    logStep("Received event", { type: event.type, id: event.id });

    // Idempotency check
    const { data: existing } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();

    if (existing) {
      logStep("Event already processed, skipping", { id: event.id });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Store event ID for idempotency
    await supabase.from("webhook_events").insert({ id: event.id });

    // Helper: find user by Stripe customer ID
    async function findUserByCustomerId(customerId: string) {
      // First check if we already have a mapping
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (sub) return sub.user_id;

      // Otherwise look up customer email from Stripe and find user
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted || !('email' in customer) || !customer.email) return null;

      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === customer.email);
      return user?.id || null;
    }

    // Helper: upsert subscription data
    async function upsertSubscription(userId: string, subscription: Stripe.Subscription, customerId: string) {
      const status = subscription.status;
      const plan = computePlan(status);
      const priceId = subscription.items.data[0]?.price?.id || null;
      const cancelAtEnd = subscription.cancel_at_period_end || false;
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          stripe_price_id: priceId,
          status,
          plan,
          cancel_at_period_end: cancelAtEnd,
          current_period_end: periodEnd,
        }, { onConflict: "user_id" });

      logStep("Subscription upserted", { userId, status, plan, cancelAtEnd });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;
          const email = session.customer_email || (session.customer_details as any)?.email;

          let userId: string | null = null;

          // Try metadata first
          if (session.metadata?.user_id) {
            userId = session.metadata.user_id;
          } else if (email) {
            const { data: users } = await supabase.auth.admin.listUsers();
            userId = users?.users?.find(u => u.email === email)?.id || null;
          }

          if (userId) {
            await upsertSubscription(userId, subscription, customerId);
          } else {
            logStep("Could not find user for checkout", { sessionId: session.id });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = await findUserByCustomerId(customerId);

        if (userId) {
          await upsertSubscription(userId, subscription, customerId);
        } else {
          logStep("No user found for customer", { customerId });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subId = invoice.subscription as string;

        if (subId) {
          const userId = await findUserByCustomerId(customerId);
          if (userId) {
            const subscription = await stripe.subscriptions.retrieve(subId);
            await upsertSubscription(userId, subscription, customerId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const userId = await findUserByCustomerId(customerId);

        if (userId) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "past_due", plan: "free" })
            .eq("user_id", userId);
          logStep("Payment failed, marked past_due", { userId });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook handler failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
