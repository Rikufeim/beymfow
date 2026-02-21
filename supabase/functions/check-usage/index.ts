import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FREE_CREDITS = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = adminCheck === true;

    if (isAdmin) {
      return new Response(JSON.stringify({
        hasActiveSubscription: true,
        canGenerate: true,
        isAdmin: true,
        subscriptionTier: 'premium',
        plan: 'pro',
        creditsRemaining: -1,
        creditsUsed: 0,
        subscriptionStatus: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Read subscription from DB (source of truth from webhooks)
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('status, plan, current_period_end, cancel_at_period_end, stripe_price_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const plan = subscription?.plan || 'free';
    const subscriptionStatus = subscription?.status || null;
    const currentPeriodEnd = subscription?.current_period_end || null;
    const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;
    const isPro = plan === 'pro';

    // Pro users get unlimited access
    if (isPro) {
      return new Response(JSON.stringify({
        hasActiveSubscription: true,
        canGenerate: true,
        subscriptionTier: 'premium',
        plan: 'pro',
        creditsRemaining: -1,
        creditsUsed: 0,
        subscriptionStatus,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Free tier: check credits with daily reset
    const { data: usage } = await supabase
      .from('user_usage')
      .select('generations_used, daily_credits_reset_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!usage) {
      await supabase.from('user_usage').insert({
        user_id: user.id,
        generations_used: 0,
        daily_credits_reset_at: new Date().toISOString()
      });
    }

    let creditsUsed = usage?.generations_used || 0;

    // Daily reset logic
    if (usage?.daily_credits_reset_at) {
      const now = new Date();
      const lastReset = new Date(usage.daily_credits_reset_at);
      const nowHelsinki = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
      const lastResetHelsinki = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));

      if (nowHelsinki.toDateString() !== lastResetHelsinki.toDateString()) {
        creditsUsed = 0;
        await supabase
          .from('user_usage')
          .update({ generations_used: 0, daily_credits_reset_at: now.toISOString() })
          .eq('user_id', user.id);
      }
    }

    const creditsRemaining = FREE_CREDITS - creditsUsed;
    return new Response(JSON.stringify({
      hasActiveSubscription: false,
      canGenerate: creditsRemaining > 0,
      subscriptionTier: 'free',
      plan: 'free',
      creditsRemaining: Math.max(0, creditsRemaining),
      creditsUsed,
      subscriptionStatus,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in check-usage:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
