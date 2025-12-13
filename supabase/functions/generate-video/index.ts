import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side cost definitions
const ANIMATION_COST = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    // Manual validation
    const prompt = body.prompt?.trim();
    if (!prompt || prompt.length < 1) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (prompt.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Prompt too long (max 2000 characters)" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const cost = ANIMATION_COST;
    
    console.log('Animation generation request:', { hasAuth: !!authHeader });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let userId: string | null = null;

    // Get user if authenticated
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError) {
        console.error('Error getting user:', userError);
      } else {
        userId = user?.id || null;
      }
    }

    // Check usage/credits if user is logged in
    if (userId) {
      const { data: usageData, error: usageError } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error checking usage:', usageError);
        throw new Error('Failed to check usage');
      }

      const hasSubscription = usageData?.has_active_subscription || false;

      if (!hasSubscription) {
        const creditsRemaining = usageData?.credits_remaining || 0;
        
        if (creditsRemaining < cost) {
          return new Response(
            JSON.stringify({ 
              error: `Not enough credits. Need ${cost}, have ${creditsRemaining}`,
              requiresSubscription: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
          );
        }

        // Deduct credits
        const { error: updateError } = await supabase
          .from('usage')
          .update({ credits_remaining: creditsRemaining - cost })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating credits:', updateError);
          throw new Error('Failed to update credits');
        }
      }
    }

    // Generate image using Lovable AI (animation-style image)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const enhancedPrompt = `Create a dynamic, cinematic image with motion and depth that captures this scene: ${prompt}. 
    The image should feel alive with atmospheric movement, depth of field, and cinematic energy.
    Use dramatic lighting, dynamic composition, motion blur where appropriate, and professional camera angles. 
    Make it feel like a living, breathing moment frozen in time - a frame that pulses with life, emotion, and movement.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract image from response (animation-style image)
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No animation image generated');
    }

    return new Response(
      JSON.stringify({ video: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-video function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
