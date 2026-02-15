import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GENERATION_COST = 2;
const FREE_CREDITS = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

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

    // --- Authentication required ---
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = adminCheck === true;

    // Read plan from DB (source of truth)
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPro = subscription?.plan === 'pro';

    // Atomic credit deduction for free-tier non-admin
    if (!isAdmin && !isPro) {
      const { data: success } = await supabaseClient
        .rpc('deduct_credits', { _user_id: user.id, _cost: cost, _free_limit: FREE_CREDITS });

      if (!success) {
        return new Response(
          JSON.stringify({ error: 'Not enough credits', requiresSubscription: true }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        messages: [{ role: 'user', content: finalPrompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate image. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Credits already deducted atomically before generation

    return new Response(
      JSON.stringify({ image: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
