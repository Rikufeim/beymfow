import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const validCategories = ['creativity', 'personal', 'business', 'crypto'];
const FREE_CREDITS = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const category = body.category;
    if (!category || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: "Invalid category. Must be one of: creativity, personal, business, crypto" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cost = body.cost || 1;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // --- AUTHENTICATION REQUIRED ---
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check admin status
    const { data: adminCheck } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const isAdmin = adminCheck === true;

    // Read plan from DB (source of truth)
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle();

    const plan = subscription?.plan || 'free';
    const isPro = plan === 'pro';

    // Atomic credit deduction for free-tier non-admin
    if (!isAdmin && !isPro) {
      const { data: success } = await supabaseClient
        .rpc('deduct_credits', { _user_id: user.id, _cost: cost, _free_limit: FREE_CREDITS });

      if (!success) {
        return new Response(JSON.stringify({
          error: 'Not enough credits',
          requiresSubscription: true
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // --- Generate prompt ---
    const systemPrompt = `You are an expert prompt engineer specializing in creating high-quality prompts for various AI tools. Generate 3 unique, creative, and highly detailed prompts for the given category.

IMPORTANT RULES:
- For Image Creation, Crypto Art, and Product Mockups: Generate 1 CUSTOM prompt (with placeholders) and 2 READY-TO-USE prompts (complete and specific)
- For all other categories: Generate 3 READY-TO-USE prompts (complete and specific)

CUSTOM PROMPT FORMAT (only for Image Creation, Crypto Art, Product Mockups):
- Title MUST include the text "(Custom Prompt)" at the end
- Include 3-5 [PLACEHOLDER] elements in square brackets that users can replace
- Provide clear instructions on what each placeholder should be

READY-TO-USE PROMPT FORMAT:
- Complete, specific, and detailed prompts ready to use immediately
- No placeholders needed
- Include all specifics, examples, and details

Category guidelines:

Image Creation (1 custom + 2 ready):
- Custom: Include [SUBJECT], [STYLE], [MOOD], [COLOR_PALETTE], [COMPOSITION]
- Ready: Specific image descriptions like "Cyberpunk street scene at night, neon lights..."

Crypto Art (1 custom + 2 ready):
- Custom: Include [ART_THEME], [BLOCKCHAIN_ELEMENT], [VISUAL_STYLE], [RARITY_TIER]
- Ready: Specific NFT concepts like "Abstract digital sculpture representing Bitcoin mining..."

Product Mockups (1 custom + 2 ready):
- Custom: Include [PRODUCT], [MATERIAL], [ENVIRONMENT], [LIGHTING], [ANGLE]
- Ready: Specific product scenes like "Minimalist white coffee mug on marble desk..."

All other categories (3 ready-to-use):
- Content Creation: Complete blog post/article/script prompts with specific topics
- Marketing: Complete campaign ideas with all details filled in
- Design: Complete UI/UX concepts with specific examples
- Business Strategy: Complete analysis frameworks with real scenarios
- Social Media: Complete posts with full text and hashtags
- Crypto Marketing: Complete Web3 narratives with specific angles

Return in JSON format:
[
  {
    "title": "Descriptive title (Custom Prompt)" or "Descriptive title",
    "prompt": "The full prompt text..."
  }
]`;

    const userPrompt = `Generate 3 creative prompts for: ${category}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
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

      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Credits already deducted atomically before generation

    return new Response(
      JSON.stringify({ prompts: JSON.parse(generatedContent) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
