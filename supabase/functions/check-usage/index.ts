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

    // Check if user is admin OR super admin email
    const SUPER_ADMIN_EMAIL = 'rikum.miettinen@live.fi';
    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
    
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = adminCheck === true || isSuperAdmin;

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

    let creditsUsed = usage?.generations_used || 0;
    
    // For Basic tier, check if we need to reset daily credits (at midnight Europe/Helsinki time)
    if (subscriptionTier === 'basic' && usage?.daily_credits_reset_at) {
      const now = new Date();
      const lastReset = new Date(usage.daily_credits_reset_at);
      
      // Convert to Europe/Helsinki timezone (UTC+2/UTC+3 depending on DST)
      const nowHelsinki = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
      const lastResetHelsinki = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
      
      // Check if it's a new day in Helsinki time
      const nowDay = nowHelsinki.toDateString();
      const lastResetDay = lastResetHelsinki.toDateString();
      
      if (nowDay !== lastResetDay) {
        // Reset credits for new day
        creditsUsed = 0;
        await supabaseClient
          .from('user_usage')
          .update({ 
            generations_used: 0,
            daily_credits_reset_at: now.toISOString()
          })
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

    // Free tier: no Prompt Lab access (home generator is unlimited if logged in)
    return new Response(JSON.stringify({
      hasActiveSubscription: false,
      canGenerate: false,
      subscriptionTier: 'free',
      creditsRemaining: 0,
      creditsUsed: 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in check-usage:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
