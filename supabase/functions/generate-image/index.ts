import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Server-side cost definitions
const GENERATION_COST = 2;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Manual validation
    const prompt = body.prompt?.trim();
    if (!prompt || prompt.length < 1) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (prompt.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Prompt too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const multiplyStyle = body.multiplyStyle || false;
    const cost = GENERATION_COST;

    // Check authentication (optional for guest users)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    let user = null;
    let isAdmin = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (!userError && authUser) {
        user = authUser;
        // Check if user is admin
        const { data: usageCheck } = await supabaseClient
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });
        isAdmin = usageCheck === true;
      }
    }

    // Check credits/subscription for authenticated users
    if (user && !isAdmin) {
      // Check subscription
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
        // Check credits
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

    console.log('Generating image with prompt:', prompt, 'Multiply Style:', multiplyStyle);

    // Precision-focused realism enhancement - prioritize exact prompt matching
    const precisionInstruction = `CRITICAL: Follow the prompt EXACTLY as described. Match all specified details precisely: object type, color, shape, material, lighting conditions, environment, composition, and perspective. Do not add creative interpretations or elements not mentioned in the prompt.`;
    
    const realismEnhancement = `Render with: Photorealistic quality, ultra high detail 8K resolution, physically accurate lighting and shadows, realistic material properties and textures, natural color accuracy, precise focus and depth of field, authentic reflections and refractions, lifelike surface details, professional photography standards, accurate scale and proportions, natural imperfections where appropriate`;
    
    const finalPrompt = multiplyStyle 
      ? `${precisionInstruction} ${prompt}. ${realismEnhancement}. Additional style: Dark atmospheric theme with deep blacks and rich purples, dramatic lighting, high contrast, mysterious elegant mood.`
      : `${precisionInstruction} ${prompt}. ${realismEnhancement}.`;

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
            content: finalPrompt
          }
        ],
        modalities: ['image', 'text']
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

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', data);
      throw new Error('No image generated');
    }

    // Update usage count for non-admin, non-subscribed users
    if (user && !isAdmin) {
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
      JSON.stringify({ image: imageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate image' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
