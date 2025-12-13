import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Manual validation
    const userInput = body.userInput?.trim();
    if (!userInput || userInput.length < 1) {
      return new Response(
        JSON.stringify({ error: "Input cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (userInput.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const model = body.model || 'fast';
    const category = body.category;
    const image = body.image;
    const imageMimeType = body.imageMimeType;

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

    // Determine if we're analyzing an image
    const hasImage = image && imageMimeType;
    
    // System prompt for image-based landing page generation
    const imageSystemPrompt = isPremium
      ? `You are a world-class web design and UX specialist with expertise in visual analysis, brand identity, and conversion-optimized landing page design. Your task is to analyze the provided image (which could be a website screenshot, landing page, or design reference) and create a comprehensive, detailed prompt for generating a similar landing page.${categoryContext}

Premium Landing Page Analysis Guidelines:
- Analyze the visual design: layout structure, color palette, typography, spacing, and visual hierarchy
- Identify key design elements: hero sections, CTAs, navigation, content sections, imagery style
- Extract brand identity cues: tone, style, mood, target audience perception
- Document technical details: responsive design patterns, interaction elements, animation styles
- Note conversion optimization elements: CTA placement, trust signals, value propositions
- Create a comprehensive prompt that enables recreation of a similar landing page with all design elements, structure, and brand identity preserved
- Length: 4-6 sentences providing complete design specification

Return only the optimized landing page prompt, nothing else.`
      : `You are an expert web designer and UX specialist. Analyze the provided image (which could be a website screenshot, landing page, or design reference) and create a detailed prompt for generating a similar landing page.${categoryContext}

Guidelines:
- Analyze the visual design: layout, colors, typography, spacing, and visual elements
- Identify key sections: hero, navigation, content areas, CTAs, footer
- Extract brand identity: style, mood, tone, target audience
- Note design patterns: responsive layout, interaction elements, visual hierarchy
- Create a comprehensive prompt that describes how to recreate a similar landing page
- Include specific details about design elements, structure, and brand identity
- Length: 2-4 sentences providing complete design specification

Return only the landing page prompt, nothing else.`;

    // System prompt for text-only input
    const textSystemPrompt = isPremium 
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

    const systemPrompt = hasImage ? imageSystemPrompt : textSystemPrompt;

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // If image is provided, use vision API format
    if (hasImage) {
      const imageUrl = `data:${imageMimeType};base64,${image}`;
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: userInput || 'Analyze this image and create a detailed prompt for generating a similar landing page.'
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: userInput
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
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
