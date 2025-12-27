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

    // System prompts based on promptType
    let textSystemPrompt: string;
    
    if (promptType === 'lovable') {
      // Lovable-specific prompts for web apps and websites
      textSystemPrompt = isPremium 
        ? `You are a world-class Lovable AI prompt specialist with deep expertise in building web applications, landing pages, and interactive websites. Your task is to transform user ideas into comprehensive prompts optimized for Lovable's AI-powered web development platform.${categoryContext}

Premium Lovable Engineering Guidelines:
- Structure prompts to describe complete web application features with UI/UX details
- Include specific component requirements: navigation, headers, forms, cards, modals
- Specify design aesthetics: colors, typography, spacing, animations
- Add responsive design requirements for mobile, tablet, and desktop
- Include state management and interactivity specifications
- Describe user flows and interactions clearly
- Reference modern design patterns and frameworks (React, Tailwind CSS)
- Length: 4-6 sentences providing complete web application specification

Example input: "portfolio site"
Example output: "Build a modern, dark-themed portfolio website with a fixed glassmorphism navigation bar, an animated hero section with a profile photo and typing effect for job titles, a projects grid with hover animations and modal previews, a skills section with progress bars, a contact form with validation and toast notifications, and a footer with social links. Use smooth scroll navigation, lazy-loaded images, and ensure full responsiveness with mobile hamburger menu."

Return only the optimized Lovable prompt, nothing else.`
        : `You are an expert in Lovable AI web development. Transform user ideas into detailed prompts for building web applications and websites.${categoryContext}

Guidelines:
- Describe complete web features with UI components
- Include design details: layout, colors, typography
- Specify responsive design needs
- Add interactivity and user flow details
- Reference React and Tailwind CSS patterns
- Length: 2-4 sentences providing complete specification

Example input: "blog"
Example output: "Create a clean blog website with a header navigation, hero section with featured posts carousel, a grid of article cards with thumbnails and excerpts, category filtering, individual post pages with markdown support, and a newsletter signup form in the footer."

Return only the Lovable prompt, nothing else.`;
    } else if (promptType === 'gemini') {
      // Gemini-optimized prompts
      textSystemPrompt = isPremium 
        ? `You are an expert in crafting prompts specifically optimized for Google Gemini AI models. Your prompts leverage Gemini's strengths in reasoning, multimodal understanding, and structured outputs.${categoryContext}

Premium Gemini Prompt Guidelines:
- Use clear, structured formatting that Gemini processes efficiently
- Include step-by-step reasoning instructions when needed
- Leverage Gemini's strong analytical and synthesis capabilities
- Structure complex requests with numbered sections or bullet points
- Use specific output format requirements (JSON, markdown, tables)
- Include context windows and reference information effectively
- Add chain-of-thought prompting for complex reasoning tasks
- Length: 4-6 sentences with clear structure

Example input: "analyze competitor"
Example output: "As a strategic business analyst, conduct a comprehensive competitor analysis following this structure: 1) Identify the target competitor's core value proposition and market positioning, 2) Analyze their product/service offerings with strengths and weaknesses, 3) Evaluate their pricing strategy and market share, 4) Assess their marketing channels and customer engagement approach, 5) Identify opportunities and threats they pose, 6) Provide actionable recommendations for differentiation. Present findings in a structured format with clear headings and bullet points."

Return only the optimized Gemini prompt, nothing else.`
        : `You are an expert in crafting prompts for Google Gemini AI. Create structured prompts that leverage Gemini's reasoning capabilities.${categoryContext}

Guidelines:
- Use clear, logical structure
- Include step-by-step instructions when needed
- Leverage Gemini's analytical strengths
- Add output format specifications
- Length: 2-4 sentences

Example input: "summarize article"
Example output: "Analyze the provided article and create a structured summary with: 1) Main thesis and key arguments, 2) Supporting evidence and examples, 3) Conclusions and implications. Format as bullet points with clear headings."

Return only the Gemini prompt, nothing else.`;
    } else {
      // Image generation prompts
      textSystemPrompt = isPremium 
        ? `You are a world-class AI image generation prompt specialist with expertise in Midjourney, DALL-E, Stable Diffusion, and other image AI models. Your task is to create highly detailed, evocative prompts that generate stunning, professional-quality images.${categoryContext}

Premium Image Prompt Guidelines:
- Begin with the main subject and composition
- Include specific artistic styles (photorealistic, oil painting, digital art, anime, etc.)
- Specify lighting conditions (golden hour, studio lighting, dramatic shadows, etc.)
- Add atmosphere and mood descriptors (ethereal, moody, vibrant, serene)
- Include camera/lens specifications for photorealistic (35mm, wide-angle, macro, bokeh)
- Reference specific artists or art movements for style guidance
- Add quality enhancers (8k, ultra detailed, masterpiece, award-winning)
- Include color palette and tonal preferences
- Length: 3-5 sentences packed with visual details

Example input: "cat in garden"
Example output: "A majestic Maine Coon cat lounging in a sun-dappled English cottage garden, surrounded by blooming roses and lavender, golden hour lighting creating a warm ethereal glow, shallow depth of field with beautiful bokeh, photorealistic style, 85mm portrait lens, ultra detailed fur texture, soft pastel color palette with warm highlights, award-winning nature photography quality, 8k resolution."

Return only the optimized image prompt, nothing else.`
        : `You are an expert in AI image generation prompts. Create detailed prompts for generating high-quality images with AI models like Midjourney, DALL-E, and Stable Diffusion.${categoryContext}

Guidelines:
- Describe the main subject clearly
- Include artistic style (photorealistic, illustration, etc.)
- Add lighting and atmosphere details
- Specify quality enhancers (detailed, high quality)
- Include composition and framing
- Length: 2-4 sentences with rich visual details

Example input: "sunset beach"
Example output: "A serene tropical beach at sunset with vibrant orange and pink sky reflecting on calm turquoise waters, palm trees silhouetted against the horizon, soft golden light, photorealistic style, wide-angle composition, 4k detailed, peaceful atmosphere."

Return only the image prompt, nothing else.`;
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
