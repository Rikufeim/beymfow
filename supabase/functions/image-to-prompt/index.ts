import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side cost definitions
const IMAGE_ANALYSIS_COST = 2;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const { image } = body;
    
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!image.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: 'Must be a valid image data URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (image.length >= 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Image too large (max 5MB)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const cost = IMAGE_ANALYSIS_COST;

    // Check authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check credits/subscription before analyzing
    const { data: usageCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = usageCheck === true;

    if (!isAdmin) {
      const stripe = await import("https://esm.sh/stripe@18.5.0");
      const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2025-08-27.basil',
      });

      const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
      let hasActiveSubscription = false;
      
      if (customers.data.length > 0) {
        const subscriptions = await stripeClient.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
          limit: 1
        });
        hasActiveSubscription = subscriptions.data.length > 0;
      }

      if (!hasActiveSubscription) {
        const { data: usage } = await supabaseClient
          .from('user_usage')
          .select('generations_used')
          .eq('user_id', user.id)
          .maybeSingle();

        const FREE_CREDITS = 5;
        const creditsUsed = usage?.generations_used || 0;
        const creditsRemaining = FREE_CREDITS - creditsUsed;

        if (creditsRemaining < cost) {
          return new Response(
            JSON.stringify({ 
              error: `Not enough credits. Need ${cost}, have ${creditsRemaining}`,
              requiresSubscription: true
            }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analyzing image to generate prompt');

    const systemPrompt = `You are an expert at analyzing images and creating detailed, accurate prompts that could recreate similar images using AI image generators.

Analyze the provided image and create a comprehensive prompt that describes:
- The main subject and its key characteristics
- The style and artistic approach (realistic, artistic, abstract, etc.)
- The composition and framing
- The lighting and atmosphere
- Colors and color palette
- Background and setting
- Important details and textures
- The mood or emotion conveyed

Create a prompt that is:
- Detailed but concise (2-3 sentences)
- Specific and descriptive
- Optimized for AI image generation
- Captures the essence and key elements of the image

Return only the prompt text, nothing else.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and create a detailed AI prompt for it.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const generatedPrompt = data.choices?.[0]?.message?.content;
    
    if (!generatedPrompt) {
      console.error('No prompt in response:', data);
      throw new Error('No prompt generated');
    }

    // Update usage count for non-admin, non-subscribed users
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdminUser = adminCheck === true;

    if (!isAdminUser) {
      const stripe = await import("https://esm.sh/stripe@18.5.0");
      const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2025-08-27.basil',
      });

      const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
      let hasActiveSubscription = false;
      
      if (customers.data.length > 0) {
        const subscriptions = await stripeClient.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
          limit: 1
        });
        hasActiveSubscription = subscriptions.data.length > 0;
      }

      if (!hasActiveSubscription) {
        const { data: currentUsage } = await supabaseClient
          .from('user_usage')
          .select('generations_used')
          .eq('user_id', user.id)
          .single();
        
        if (currentUsage) {
          await supabaseClient
            .from('user_usage')
            .update({ generations_used: currentUsage.generations_used + cost })
            .eq('user_id', user.id);
          console.log('Updated usage count:', { userId: user.id, newCount: currentUsage.generations_used + cost });
        }
      }
    }

    return new Response(
      JSON.stringify({ prompt: generatedPrompt.trim() }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in image-to-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze image' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
