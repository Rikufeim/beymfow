import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // If we have a webhook secret, verify signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : err });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else {
      // Without webhook secret, parse event directly (development mode)
      event = JSON.parse(body) as Stripe.Event;
    }

    logStep("Received event", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerEmail = session.customer_email || (session.customer_details as any)?.email;

          if (customerEmail) {
            // Find user by email
            const { data: users } = await supabaseClient.auth.admin.listUsers();
            const user = users?.users?.find(u => u.email === customerEmail);

            if (user) {
              // Upsert subscription record
              await supabaseClient
                .from("user_subscriptions")
                .upsert({
                  user_id: user.id,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: session.customer as string,
                  status: subscription.status,
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                }, { onConflict: "user_id" });

              logStep("Subscription saved", { userId: user.id, subscriptionId: subscription.id });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find subscription by stripe_customer_id
        const { data: existingSub } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (existingSub) {
          await supabaseClient
            .from("user_subscriptions")
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", existingSub.user_id);

          logStep("Subscription updated", { userId: existingSub.user_id, status: subscription.status });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: existingSub } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (existingSub) {
          await supabaseClient
            .from("user_subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", existingSub.user_id);

          logStep("Payment failed, marked past_due", { userId: existingSub.user_id });
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
