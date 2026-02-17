import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, createUnauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const { user, error: authError } = await validateAuth(req);
  if (authError || !user) {
    console.log("Unauthorized request to quick-prompt");
    return createUnauthorizedResponse(corsHeaders, authError || "Authentication required");
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
    const promptType = body.promptType || 'lovable'; // lovable, gemini, image
    // Support both single image (legacy) and multiple images
    const images: { data: string; mimeType: string }[] = body.images || [];
    // Legacy support for single image
    if (body.image && body.imageMimeType) {
      images.push({ data: body.image, mimeType: body.imageMimeType });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Model selection: fast = instant quality, advanced = deep & comprehensive, premium = maximum
    const selectedModel = model === 'premium' 
      ? 'openai/gpt-5'
      : model === 'advanced' 
      ? 'google/gemini-2.5-pro' 
      : 'google/gemini-3-flash-preview';
    
    const isFast = model === 'fast';
    const isAdvanced = model === 'advanced';

    // Premium gets enhanced system prompt
    const isPremium = model === 'premium';

    // Category-specific context
    const categoryContext = category ? `\n\nContext: This prompt is for ${category.toUpperCase()} purposes. ${
      category === 'creativity' ? 'Focus on creative, artistic, and innovative aspects with deep aesthetic understanding.' :
      category === 'personal' ? 'Focus on personal development, growth, and self-improvement with psychological insights.' :
      category === 'business' ? 'Focus on business strategy, growth, and professional outcomes with market intelligence.' :
      'Focus on crypto, blockchain, DeFi, and Web3 opportunities with technical and economic depth.'
    }` : '';

    // Determine if we're analyzing images
    const hasImages = images.length > 0;
    
    // System prompt for image-based landing page generation (supports multiple images)
    const imageCount = images.length;
    const imageSystemPrompt = isPremium
      ? `You are a world-class web design and UX specialist with expertise in visual analysis, brand identity, and conversion-optimized landing page design. Your task is to analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} (which could be website screenshots, landing pages, or design references) and create a comprehensive, detailed prompt for generating a similar landing page.${categoryContext}

Premium Landing Page Analysis Guidelines:
${imageCount > 1 ? '- Analyze all provided images holistically, understanding how they relate to each other (different sections, variations, or complementary designs)' : ''}
- Analyze the visual design: layout structure, color palette, typography, spacing, and visual hierarchy
- Identify key design elements: hero sections, CTAs, navigation, content sections, imagery style
- Extract brand identity cues: tone, style, mood, target audience perception
- Document technical details: responsive design patterns, interaction elements, animation styles
- Note conversion optimization elements: CTA placement, trust signals, value propositions
- Create a comprehensive prompt that enables recreation of a similar landing page with all design elements, structure, and brand identity preserved
${imageCount > 1 ? '- Synthesize insights from all images into a cohesive design specification' : ''}
- Length: 4-6 sentences providing complete design specification

Return only the optimized landing page prompt, nothing else.`
      : `You are an expert web designer and UX specialist. Analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} (which could be website screenshots, landing pages, or design references) and create a detailed prompt for generating a similar landing page.${categoryContext}

Guidelines:
${imageCount > 1 ? '- Consider all provided images together, understanding their relationship and combined design intent' : ''}
- Analyze the visual design: layout, colors, typography, spacing, and visual elements
- Identify key sections: hero, navigation, content areas, CTAs, footer
- Extract brand identity: style, mood, tone, target audience
- Note design patterns: responsive layout, interaction elements, visual hierarchy
- Create a comprehensive prompt that describes how to recreate a similar landing page
- Include specific details about design elements, structure, and brand identity
${imageCount > 1 ? '- Combine insights from all images into a unified design specification' : ''}
- Length: 2-4 sentences providing complete design specification

Return only the landing page prompt, nothing else.`;

    // System prompts based on promptType and model tier
    let textSystemPrompt: string;
    
    // Quality tier instruction
    const qualityTier = isFast 
      ? 'Generate a focused, high-quality prompt. Be direct and concise but ensure every detail matters. 2-4 sentences.'
      : isAdvanced
      ? 'Generate an extremely comprehensive, deeply detailed prompt. Cover every aspect exhaustively. Leave nothing to interpretation. 6-10 sentences minimum.'
      : 'Generate the ultimate, production-grade prompt with expert-level depth. This should be so detailed that executing it produces professional-quality results indistinguishable from expert work. 8-15 sentences.';
    
    if (promptType === 'lovable') {
      // LOVABLE PROMPT - webapp/website generation ONLY
      textSystemPrompt = `You are an elite Lovable AI product architect. You create COMPLETE webapp and website prompts that result in fully functional applications.

YOUR OUTPUT MUST ALWAYS BE A SINGLE, COMPREHENSIVE PROMPT that Lovable can execute to build a complete product.
The user wants to build an app or a website. If the user says something like "online business" or "fitness tracker", you MUST generate a prompt for building a web application or website for that concept.

${isFast ? `FAST MODE - Create a focused but complete prompt covering:
- App type, pages, and navigation structure
- Core features and functionality
- Design direction: colors (hex), fonts, dark/light mode
- Key UI components and layout
- Responsive behavior

Write as ONE flowing paragraph. Be specific with colors, features, and layout. Include everything needed to build without follow-up questions.` : `COMPREHENSIVE MODE - Create an exhaustive prompt covering:

1. PRODUCT DEFINITION: App type, core value proposition, target user persona
2. PAGES & ROUTING: ALL pages with their purpose, navigation structure, protected routes
3. FEATURES & FUNCTIONALITY: Authentication (email/OAuth), database models and relationships, CRUD operations, real-time features, file uploads, payments, notifications
4. UI/UX SPECIFICATIONS: Design system (dark/light mode, exact hex color palette), typography (font families, size scale), components (cards, buttons, forms, modals, toasts), animations (Framer Motion micro-interactions, page transitions, hover states), responsive breakpoints (mobile 375px, tablet 768px, desktop 1280px+)
5. LAYOUT STRUCTURE (per page): Header/Navbar, Hero section, Content sections, Footer with complete details
6. TECH STACK: React + TypeScript + Vite, Tailwind CSS + shadcn/ui, Supabase, Framer Motion, React Query
7. DATABASE SCHEMA: Tables, columns, relationships, RLS policies

Write as ONE continuous paragraph. Include EVERY detail needed. Be specific: exact colors, exact features, exact layouts. If user input is vague, EXPAND it intelligently into a full product.`}

${categoryContext}

CRITICAL RULES:
- NEVER output bullet points, markdown, or formatted lists
- Write as ONE continuous paragraph of build instructions
- Include ALL design details: exact hex colors, font families, spacing
- Specify exact features, pages, and interactions
- If the user's idea is brief, expand it into a complete product vision
- ALWAYS generate a web app or website prompt, never a generic text prompt

Return ONLY the complete Lovable prompt.`;

    } else if (promptType === 'gemini') {
      // GEMINI PROMPT - general purpose, topic-relevant (NOT app/website unless user explicitly asks)
      textSystemPrompt = `You are an expert prompt engineer specializing in creating prompts optimized for Google Gemini AI models. Transform any user idea into a powerful, structured prompt.

IMPORTANT: Generate a prompt that is RELEVANT TO THE USER'S TOPIC. If the user says "online business", generate a prompt about online business strategy, planning, marketing, etc. Do NOT generate a prompt for building an app or website unless the user explicitly asks for that.

${isFast ? `FAST MODE - Create a clear, well-structured prompt with:
- Precise role definition
- Clear task description with expected output
- Output format specification
- Key quality criteria

Write a focused prompt that gets excellent results immediately.` : `COMPREHENSIVE MODE - Create a deeply structured prompt with:

1. ROLE DEFINITION: Expert persona with specific domain knowledge areas
2. CONTEXT: Background information and constraints the model needs
3. TASK BREAKDOWN: Step-by-step methodology with clear reasoning chain
4. OUTPUT SPECIFICATION: Exact format, structure, length, and quality requirements
5. QUALITY CRITERIA: What makes the output excellent vs. mediocre
6. EDGE CASES: How to handle ambiguity, missing data, or unusual inputs
7. EXAMPLES: Concrete input/output examples demonstrating expected quality

Create a prompt that leverages Gemini's strengths in reasoning, analysis, and structured output.`}

${categoryContext}

CRITICAL: The output must be a READY-TO-USE prompt, not instructions about prompting. The user should be able to paste this directly into Gemini and get excellent results. Generate prompts relevant to the user's actual topic — NOT app or website building prompts unless explicitly requested.

Return ONLY the optimized prompt.`;

    } else if (promptType === 'image') {
      // IMAGE PROMPT - maximum visual quality
      textSystemPrompt = `You are a master AI image generation prompt artist. Create prompts that produce stunning imagery across Midjourney, DALL-E, Stable Diffusion, Flux, and other AI image generators.

${isFast ? `FAST MODE - Create a vivid, detailed image prompt with:
- Clear subject description with specific attributes
- Artistic style and medium
- Lighting and atmosphere
- Composition and perspective
- Essential quality modifiers (8k, detailed, etc.)

Write ONE compelling image generation prompt. Be specific and visual.` : `COMPREHENSIVE MODE - Create a masterpiece-level image prompt with:

1. SUBJECT: Extremely detailed description with materials, textures, expressions, positioning
2. ENVIRONMENT: Setting, weather, time of day, ambient elements
3. STYLE: Specific artistic style, rendering technique, medium, art movement references
4. LIGHTING: Type (rim, volumetric, ambient occlusion), direction, color temperature, shadows
5. COMPOSITION: Camera angle, lens type, focal length, depth of field, framing
6. COLOR PALETTE: Dominant colors, accent colors, color harmony type
7. ATMOSPHERE: Mood, emotional tone, narrative feeling
8. TECHNICAL: Resolution (8k), quality modifiers (masterpiece, award-winning, cinematic), render engine references

Create a prompt so detailed that ANY AI image generator produces stunning, professional-quality art.`}

${categoryContext}

CRITICAL: Output ONLY the image prompt. No explanations, no prefixes. Just the pure image description ready to paste into any AI image generator.

Return ONLY the image prompt.`;

    } else {
      // DEFAULT / no tool selected — generate topic-relevant prompts, NOT app/website prompts
      textSystemPrompt = `You are an expert-level prompt engineer and AI workflow designer.
Your task is to generate high-quality, optimized prompts based on the user's topic.

IMPORTANT: Generate a prompt that is DIRECTLY RELEVANT to what the user is asking about. If the user says "online business", create a prompt about online business strategies, planning, revenue models, etc. If the user says "fitness", create a prompt about fitness plans, nutrition, etc. Do NOT generate prompts for building apps or websites unless the user explicitly asks for that.

${isFast ? `FAST MODE - Create a focused, actionable prompt:
- Define a clear expert role relevant to the topic
- State the objective precisely
- Include key requirements and constraints
- Specify the expected output format
- 2-4 sentences, direct and powerful.` : `COMPREHENSIVE MODE - Create a deeply detailed prompt:
1. ROLE: Expert persona with domain-specific knowledge
2. OBJECTIVE: Clear, measurable goal
3. CONTEXT: Background information and constraints
4. REQUIREMENTS: Detailed specifications and quality criteria
5. OUTPUT FORMAT: Exact structure and format expected
6. QUALITY CRITERIA: What makes the output excellent

6-10+ sentences covering every aspect exhaustively.`}

${categoryContext}

${qualityTier}

CRITICAL: Generate prompts about the USER'S ACTUAL TOPIC. Never default to app/website building. The prompt should be ready to paste into any AI and get excellent, topic-relevant results.

Return ONLY the optimized prompt.`;
    }

    const systemPrompt = hasImages ? imageSystemPrompt : textSystemPrompt;

    // Build messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // If images are provided, use vision API format
    if (hasImages) {
      const defaultText = images.length > 1 
        ? `Analyze these ${images.length} images and create a detailed prompt for generating a similar landing page that incorporates elements from all of them.`
        : 'Analyze this image and create a detailed prompt for generating a similar landing page.';
      
      const contentParts: any[] = [
        {
          type: 'text',
          text: userInput || defaultText
        }
      ];
      
      // Add all images
      for (const img of images) {
        const imageUrl = `data:${img.mimeType};base64,${img.data}`;
        contentParts.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      }
      
      messages.push({
        role: 'user',
        content: contentParts
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
