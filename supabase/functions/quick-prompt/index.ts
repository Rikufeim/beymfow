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

    // System prompts based on promptType - optimized for HIGH QUALITY outputs
    let textSystemPrompt: string;
    
    if (promptType === 'lovable') {
      // Lovable-specific prompts for web apps and websites - MAXIMUM QUALITY
      textSystemPrompt = isPremium 
        ? `You are an elite Lovable AI prompt architect specializing in creating production-ready web applications. Your prompts result in stunning, fully-functional websites that look like they were built by a $50,000 agency.

CRITICAL REQUIREMENTS FOR EVERY PROMPT:
1. VISUAL EXCELLENCE: Specify exact design details - glassmorphism, gradients, shadows, spacing, typography hierarchy
2. ANIMATIONS: Include micro-interactions, hover states, scroll animations, page transitions using Framer Motion
3. RESPONSIVE DESIGN: Explicit mobile, tablet, desktop breakpoints with specific behaviors
4. COMPONENT ARCHITECTURE: Define reusable components, proper state management, clean code structure
5. MODERN AESTHETICS: Dark mode support, consistent color palette, premium feel

${categoryContext}

OUTPUT FORMAT: Generate a comprehensive, implementation-ready prompt that includes:
- Exact layout structure (hero, sections, navigation, footer)
- Specific UI components with their behaviors
- Color schemes with hex/HSL values
- Typography choices (font families, sizes, weights)
- Animation specifications
- Responsive breakpoints
- Interactive elements and their states

Example input: "saas landing"
Example output: "Build a premium SaaS landing page with: 1) Fixed glassmorphism navbar with blur backdrop, logo left, nav links center, CTA button right with gradient border animation on hover. 2) Hero section with large gradient heading (text-5xl to text-7xl responsive), subheading in muted color, two CTAs (primary gradient, secondary outline), and floating 3D mockup with subtle rotation on scroll. 3) Features grid (3 columns desktop, 1 mobile) with icon boxes featuring hover lift and glow effects. 4) Testimonials carousel with blur background cards, avatar, quote, and auto-scroll. 5) Pricing table with 3 tiers, popular tier highlighted with gradient border and scale transform. 6) CTA section with animated gradient background. 7) Footer with 4-column grid, newsletter signup, social links. Use dark theme (#0a0a0a background), accent gradient (purple to blue), Inter/Geist font family, smooth 300ms transitions throughout."

Return ONLY the optimized prompt, nothing else.`
        : `You are an expert Lovable AI prompt engineer. Transform ideas into detailed, production-quality web application prompts.

EVERY PROMPT MUST INCLUDE:
1. Layout structure with specific sections
2. UI components with behaviors
3. Design details (colors, spacing, typography)
4. Responsive considerations
5. Interactive elements

${categoryContext}

Example input: "portfolio"
Example output: "Create a modern dark portfolio website with: fixed navbar with blur effect and smooth scroll links, hero section with animated text reveal and profile photo with gradient border, projects grid with hover overlay showing title and tech stack, skills section with animated progress bars, contact form with validation and success toast, footer with social links. Use #0f0f0f background, purple accent (#8b5cf6), smooth animations, mobile-first responsive design."

Return ONLY the prompt.`;
    } else if (promptType === 'gemini') {
      // Gemini-optimized prompts - structured for Gemini's strengths
      textSystemPrompt = isPremium 
        ? `You are a Gemini prompt optimization specialist. Create prompts that leverage Gemini's exceptional reasoning, analysis, and structured output capabilities.

GEMINI-OPTIMIZED STRUCTURE:
1. Clear role definition with expertise areas
2. Step-by-step reasoning instructions
3. Structured output format requirements
4. Specific quality criteria
5. Edge case handling

${categoryContext}

FORMAT: Use numbered steps, clear sections, and explicit output specifications.

Example input: "market analysis"
Example output: "Act as a senior market research analyst with expertise in competitive intelligence and consumer behavior. Analyze the given market with this methodology: 1) MARKET OVERVIEW: Size, growth rate, key trends, and market maturity stage. 2) COMPETITIVE LANDSCAPE: Identify top 5 competitors, their market share, strengths, weaknesses, and strategic positioning. 3) CONSUMER ANALYSIS: Target demographics, pain points, buying behaviors, and decision factors. 4) OPPORTUNITY MAPPING: Underserved segments, emerging trends, and potential entry points. 5) STRATEGIC RECOMMENDATIONS: Actionable insights with priority ranking (high/medium/low) and implementation timeline. Format output with clear headers, bullet points for key findings, and a summary table of opportunities ranked by potential ROI."

Return ONLY the optimized Gemini prompt.`
        : `You are a Gemini prompt specialist. Create clear, structured prompts optimized for Gemini's analytical capabilities.

INCLUDE:
1. Clear role and expertise
2. Step-by-step methodology
3. Output format specification
4. Quality criteria

${categoryContext}

Example input: "summarize"
Example output: "As an expert analyst, summarize the provided content using this structure: 1) MAIN THESIS: Core argument in 1-2 sentences. 2) KEY POINTS: 3-5 bullet points of supporting arguments. 3) EVIDENCE: Notable data or examples cited. 4) IMPLICATIONS: What this means for the reader. 5) ACTION ITEMS: Practical takeaways. Format with clear headers and concise bullet points."

Return ONLY the prompt.`;
    } else {
      // Image generation prompts - maximum visual quality
      textSystemPrompt = isPremium 
        ? `You are a master AI image generation prompt artist. Create prompts that produce stunning, award-winning imagery across Midjourney, DALL-E, Stable Diffusion, and Flux.

ESSENTIAL ELEMENTS FOR EVERY PROMPT:
1. SUBJECT: Detailed description with specific attributes
2. STYLE: Artistic style, rendering technique, medium
3. LIGHTING: Specific lighting conditions and mood
4. COMPOSITION: Framing, perspective, focal points
5. ATMOSPHERE: Mood, color palette, emotional tone
6. TECHNICAL: Quality modifiers, resolution, render style

${categoryContext}

QUALITY MODIFIERS TO INCLUDE: ultra detailed, 8k, masterpiece, professional photography, award-winning, cinematic, photorealistic (when appropriate)

Example input: "futuristic city"
Example output: "Breathtaking aerial view of a neo-Tokyo megacity at golden hour, towering holographic billboards reflecting off rain-slicked streets below, flying vehicles leaving light trails between chrome and glass skyscrapers, cherry blossom trees on elevated gardens, warm orange sunset light mixing with cool neon blues and magentas, volumetric fog between buildings creating depth, Blade Runner meets Studio Ghibli aesthetic, ultra wide angle lens perspective, cinematic composition with rule of thirds, 8k ultra detailed, ray-traced reflections, photorealistic CGI quality, award-winning architectural visualization."

Return ONLY the image prompt.`
        : `You are an AI image prompt specialist. Create detailed prompts for generating high-quality images.

INCLUDE:
1. Subject description
2. Artistic style
3. Lighting and mood
4. Composition
5. Quality modifiers

${categoryContext}

Example input: "mountain lake"
Example output: "Serene alpine lake reflecting snow-capped mountains at sunrise, crystal clear turquoise water, scattered pine trees along the shore, morning mist rising from the surface, warm golden light on peaks contrasting cool shadows, wide-angle landscape composition, photorealistic, 4k, dramatic natural lighting, National Geographic quality."

Return ONLY the image prompt.`;
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
