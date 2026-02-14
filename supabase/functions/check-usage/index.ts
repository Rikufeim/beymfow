import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Subscription tier product IDs
    const BASIC_PRODUCT_ID = 'prod_TJQgWoDVMoKIKM';
    const PREMIUM_PRODUCT_ID = 'prod_TJQgOZ9ghkOhCA';
    const BASIC_CREDITS = 3;
    const FREE_CREDITS = 3;
    // Check subscription status and tier
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let subscriptionTier: 'free' | 'basic' | 'premium' = 'free';
    let hasActiveSubscription = false;
    
    if (customers.data.length > 0) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        limit: 1
      });
      
      if (subscriptions.data.length > 0) {
        hasActiveSubscription = true;
        const productId = subscriptions.data[0].items.data[0].price.product;
        
        if (productId === PREMIUM_PRODUCT_ID) {
          subscriptionTier = 'premium';
        } else if (productId === BASIC_PRODUCT_ID) {
          subscriptionTier = 'basic';
        }
      }
    }

    // Check if user is admin using proper role-based access control
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = adminCheck === true;

    // Admin or Super Admin has unlimited access
    if (isAdmin) {
      return new Response(JSON.stringify({
        hasActiveSubscription: true,
        canGenerate: true,
        isAdmin: true,
        subscriptionTier: 'premium',
        creditsRemaining: -1,
        creditsUsed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check user credits from user_usage table with daily reset timestamp
    const { data: usage } = await supabaseClient
      .from('user_usage')
      .select('generations_used, daily_credits_reset_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // If no usage row exists, create one
    if (!usage) {
      await supabaseClient.from('user_usage').insert({
        user_id: user.id,
        generations_used: 0,
        daily_credits_reset_at: new Date().toISOString()
      });
    }

    let creditsUsed = usage?.generations_used || 0;
    
    // Daily reset logic for basic and free tiers
    if ((subscriptionTier === 'basic' || subscriptionTier === 'free') && usage?.daily_credits_reset_at) {
      const now = new Date();
      const lastReset = new Date(usage.daily_credits_reset_at);
      const nowHelsinki = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
      const lastResetHelsinki = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
      
      if (nowHelsinki.toDateString() !== lastResetHelsinki.toDateString()) {
        creditsUsed = 0;
        await supabaseClient
          .from('user_usage')
          .update({ generations_used: 0, daily_credits_reset_at: now.toISOString() })
          .eq('user_id', user.id);
      }
    }

    // Premium tier: unlimited access
    if (subscriptionTier === 'premium') {
      return new Response(JSON.stringify({
        hasActiveSubscription: true,
        canGenerate: true,
        subscriptionTier: 'premium',
        creditsRemaining: -1,
        creditsUsed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Basic tier: 3 credits per day
    if (subscriptionTier === 'basic') {
      const creditsRemaining = BASIC_CREDITS - creditsUsed;
      const canGenerate = creditsRemaining > 0;
      
      return new Response(JSON.stringify({
        hasActiveSubscription: true,
        canGenerate: canGenerate,
        subscriptionTier: 'basic',
        creditsRemaining: Math.max(0, creditsRemaining),
        creditsUsed: creditsUsed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Free tier: 3 prompts per day
    const freeCreditsRemaining = FREE_CREDITS - creditsUsed;
    return new Response(JSON.stringify({
      hasActiveSubscription: false,
      canGenerate: freeCreditsRemaining > 0,
      subscriptionTier: 'free',
      creditsRemaining: Math.max(0, freeCreditsRemaining),
      creditsUsed: creditsUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in check-usage:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
