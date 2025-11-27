import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const quickPromptSchema = z.object({
  userInput: z.string().trim().min(1, "Input cannot be empty").max(2000, "Input too long (max 2000 characters)"),
  model: z.enum(['fast', 'advanced', 'premium']).optional(),
  category: z.enum(['creativity', 'personal', 'business', 'crypto']).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = quickPromptSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { userInput, model, category } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const selectedModel = model === 'premium' 
      ? 'openai/gpt-5'
      : model === 'advanced' 
      ? 'google/gemini-2.5-pro' 
      : 'google/gemini-2.5-flash';

    // Premium gets enhanced system prompt
    const isPremium = model === 'premium';

    // Category-specific context
    const categoryContext = category ? `\n\nContext: This prompt is for ${category.toUpperCase()} purposes. ${
      category === 'creativity' ? 'Focus on creative, artistic, and innovative aspects with deep aesthetic understanding.' :
      category === 'personal' ? 'Focus on personal development, growth, and self-improvement with psychological insights.' :
      category === 'business' ? 'Focus on business strategy, growth, and professional outcomes with market intelligence.' :
      'Focus on crypto, blockchain, DeFi, and Web3 opportunities with technical and economic depth.'
    }` : '';

    const systemPrompt = isPremium 
      ? `You are a world-class AI prompt engineering specialist with expertise in cognitive science, linguistics, and AI behavior optimization. Your task is to transform user descriptions into exceptionally crafted, multi-dimensional prompts that maximize AI output quality.${categoryContext}

Premium Engineering Guidelines:
- Begin with a sophisticated role definition that incorporates domain expertise and methodological frameworks
- Structure the prompt with clear hierarchical thinking: context → objectives → methodology → deliverables
- Include nuanced specifications: target audience psychographics, desired tone and style, success metrics
- Embed strategic thinking patterns: problem decomposition, critical analysis, creative synthesis
- Add meta-instructions for output format, depth, and quality standards
- Anticipate edge cases and provide guidance for handling them
- Create self-reinforcing instructions that guide the AI toward exceptional outputs
- Length: 4-6 sentences that provide comprehensive, layered context with strategic depth

Example input: "I want to sell shoes"
Example output: "As a retail strategist with expertise in consumer psychology, market segmentation, and omnichannel commerce, develop a comprehensive go-to-market strategy for launching a shoe brand. Begin by analyzing market gaps and consumer psychographics to identify high-value niches (e.g., sustainable fashion, performance athletics, lifestyle luxury). Structure your response to include: (1) brand positioning and unique value proposition, (2) product-market fit analysis with competitive differentiation, (3) integrated marketing strategy spanning digital channels (SEO, social, influencer), physical retail, and community building, (4) pricing architecture optimized for perceived value and margin, and (5) scalable sales systems with conversion optimization. Prioritize actionable insights backed by market data, psychological triggers, and proven retail frameworks that can be implemented immediately."

Return only the optimized premium prompt, nothing else.`
      : `You are an expert AI prompt engineer. Your task is to take a brief user description and transform it into a detailed, comprehensive AI prompt that will help them achieve their goal.${categoryContext}

Guidelines:
- Start with a clear role definition (e.g., "As an experienced [relevant expert]...")
- Include comprehensive instructions and context
- Break down the request into specific sub-tasks and areas to address
- Add relevant details like target audience, methods, strategies, and desired outcomes
- Make it actionable with clear deliverables
- Keep professional tone
- Length: 2-4 sentences that provide complete context

Example input: "I want to sell shoes"
Example output: "As an experienced retail and e-commerce specialist, please help me develop a comprehensive strategy to sell shoes effectively, including target market identification, product selection, pricing strategies, marketing channels (both online and offline), branding approach, and sales tactics to maximize reach and profitability in the competitive footwear market."

Return only the optimized prompt, nothing else.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
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
          JSON.stringify({ error: 'Payment required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway request failed');
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('No prompt generated');
    }

    return new Response(
      JSON.stringify({ prompt: generatedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
