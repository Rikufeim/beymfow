import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Product IDs mapped to tiers
const PRODUCTS = {
  pro: "prod_TJQgOZ9ghkOhCA",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("User authenticated", { email: user.email });

    const body = await req.json();
    const { tier, priceId } = body;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Resolve priceId: use provided priceId, or look up from product
    let resolvedPriceId = priceId;

    if (!resolvedPriceId && tier) {
      const productId = PRODUCTS[tier as keyof typeof PRODUCTS];
      if (!productId) {
        return new Response(JSON.stringify({ error: "Invalid tier" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find active price for product
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        type: "recurring",
        limit: 1,
      });

      if (prices.data.length === 0) {
        logStep("No active price found for product", { productId });
        return new Response(JSON.stringify({ error: "No active pricing found for this plan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      resolvedPriceId = prices.data[0].id;
      logStep("Resolved price from product", { productId, priceId: resolvedPriceId });
    }

    if (!resolvedPriceId) {
      return new Response(JSON.stringify({ error: "Price ID or tier required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });

      // Check if already subscribed
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      if (subs.data.length > 0) {
        logStep("User already has active subscription");
        return new Response(JSON.stringify({ error: "You already have an active subscription. Use the customer portal to manage it." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const origin = req.headers.get("origin") || "https://testerbeym.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/premium`,
      metadata: {
        user_id: user.id,
        tier: tier || "pro",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
