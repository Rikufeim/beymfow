import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const promptRequestSchema = z.object({
  category: z.enum(['creativity', 'personal', 'business', 'crypto'], {
    errorMap: () => ({ message: "Invalid category. Must be one of: creativity, personal, business, crypto" })
  }),
  cost: z.number().int().min(1).max(10).optional().default(1)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = promptRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { category, cost } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Check authentication and usage limits
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    let user = null;
    let hasActiveSubscription = false;
    let isAdmin = false;

    // Check if this is a real user token or just the anon key
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const isAnonKey = authHeader && authHeader.includes(anonKey || '');

    // If no auth header or if it's just the anon key, allow one anonymous generation
    if (!authHeader || isAnonKey) {
      console.log('Anonymous user - allowing one free generation');
    } else {
      // Authenticated user
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(token);
      
      if (userError || !authUser) {
        return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      user = authUser;

      // Check if user is admin
      const { data: adminCheck } = await supabaseClient
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      isAdmin = adminCheck === true;
      
      console.log('User authenticated:', { userId: user.id, email: user.email, isAdmin });

      // Check subscription status for authenticated users
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2025-08-27.basil',
      });

      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        const customerId = customers.data[0].id;
        console.log('Found Stripe customer:', { customerId, email: user.email });
        
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
          limit: 1
        });
        hasActiveSubscription = subscriptions.data.length > 0;
        
        console.log('Subscription check:', { 
          hasActiveSubscription, 
          subscriptionCount: subscriptions.data.length,
          subscriptions: subscriptions.data.map(s => ({ id: s.id, status: s.status }))
        });
      } else {
        console.log('No Stripe customer found for:', user.email);
      }

      // Admin has unlimited access
      if (!isAdmin && !hasActiveSubscription) {
        console.log('Checking usage limits for non-subscriber');
        
        // Get or create user usage
        let { data: usage } = await supabaseClient
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!usage) {
          const { data: newUsage } = await supabaseClient
            .from('user_usage')
            .insert({ user_id: user.id, generations_used: 0 })
            .select()
            .single();
          usage = newUsage;
        }

        const FREE_CREDITS = 5;
        const creditsUsed = usage.generations_used;
        const creditsRemaining = FREE_CREDITS - creditsUsed;

        // Check if user has enough credits
        if (creditsRemaining < cost) {
          console.log('User does not have enough credits:', { 
            userId: user.id, 
            creditsRemaining, 
            cost 
          });
          return new Response(JSON.stringify({ 
            error: `Not enough credits. Need ${cost}, have ${creditsRemaining}`,
            requiresSubscription: true
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else if (isAdmin) {
        console.log('Admin user - unlimited access');
      } else if (hasActiveSubscription) {
        console.log('Subscriber user - unlimited access:', { userId: user.id, email: user.email });
      }
    }

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
    
    // Update usage count for authenticated users if not admin and not subscribed
    if (user && !isAdmin && !hasActiveSubscription) {
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
