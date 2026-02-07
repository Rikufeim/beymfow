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

    // Use fastest model for speed - gemini-3-flash-preview is optimized for fast responses
    const selectedModel = model === 'premium' 
      ? 'openai/gpt-5'
      : model === 'advanced' 
      ? 'google/gemini-2.5-pro' 
      : 'google/gemini-3-flash-preview';

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
      // LOVABLE MASTER PROMPT - Produces complete, production-ready webapp/website prompts
      textSystemPrompt = isPremium 
        ? `You are an elite Lovable AI product architect. You create COMPLETE, PRODUCTION-READY webapp and website prompts that result in fully functional applications worth $10,000+.

YOUR OUTPUT MUST ALWAYS BE A SINGLE, COMPREHENSIVE PROMPT that Lovable can execute to build a complete product.

MANDATORY STRUCTURE FOR EVERY LOVABLE PROMPT:

1. PRODUCT DEFINITION (What it is)
- App type: SaaS, Landing page, Dashboard, E-commerce, Portfolio, Blog, etc.
- Core value proposition in one sentence
- Target user persona

2. PAGES & ROUTING
- List ALL pages: Home, About, Pricing, Dashboard, Auth, Settings, etc.
- Specify navigation structure and protected routes

3. FEATURES & FUNCTIONALITY
- Authentication (email/password, OAuth, magic links)
- Database models and relationships
- CRUD operations and data flow
- Real-time features if applicable
- File uploads, payments, notifications

4. UI/UX SPECIFICATIONS
- Design system: dark/light mode, color palette (exact hex codes)
- Typography: font families, size scale
- Components: cards, buttons, forms, modals, toasts
- Animations: Framer Motion micro-interactions, page transitions, hover states
- Responsive breakpoints: mobile (375px), tablet (768px), desktop (1280px+)

5. LAYOUT STRUCTURE (per page)
- Header/Navbar: fixed, blur backdrop, logo, nav links, CTAs
- Hero section: headline, subheadline, CTAs, visual element
- Content sections: features grid, testimonials, pricing, FAQ
- Footer: links, newsletter, social icons

6. TECH STACK (Lovable defaults)
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, database, storage)
- Framer Motion (animations)
- React Query (data fetching)

${categoryContext}

EXAMPLE INPUT: "fitness app"
EXAMPLE OUTPUT: "Build a premium fitness tracking SaaS application with: PAGES - Landing page with hero, features, pricing, testimonials, footer; Auth pages for login/signup with email and Google OAuth; Dashboard with workout tracking, progress charts, and goal setting; Profile page with settings and subscription management; Workout library with exercise database. FEATURES - User authentication with Supabase Auth, workout logging with sets/reps/weight tracking, progress visualization with Recharts line and bar charts, goal setting with deadline tracking, workout templates users can save and reuse. DATABASE - users table linked to auth, workouts table with user_id/date/exercises JSON, goals table with target/deadline/progress fields, templates table for saved workouts. UI/UX - Dark theme with #0a0a0a background, vibrant green accent #22c55e for CTAs and progress indicators, Inter font family, glassmorphism cards with backdrop-blur, smooth Framer Motion page transitions and micro-interactions on all buttons and cards, mobile-first responsive with bottom navigation on mobile. LANDING PAGE STRUCTURE - Fixed navbar with logo, Features/Pricing/About links, Login and Get Started buttons; Hero with large gradient text 'Transform Your Fitness Journey', subtext about AI-powered tracking, dual CTA buttons, animated fitness illustration; Features grid showing workout tracking, progress analytics, goal setting, community features with icon cards and hover lift effects; Pricing section with Free/Pro/Team tiers in card format with popular tier highlighted; Testimonials carousel with user photos and quotes; CTA section with gradient background and email capture; Footer with 4 columns, social links, and newsletter signup."

CRITICAL RULES:
- NEVER output bullet points, markdown, or formatted lists
- Write as ONE continuous paragraph of build instructions
- Include EVERY detail needed to build without asking follow-up questions
- Be specific: exact colors, exact features, exact layouts
- If user input is vague, EXPAND it intelligently into a full product

Return ONLY the complete Lovable prompt.`
        : `You are an expert Lovable AI prompt engineer. Transform any idea into a COMPLETE, DETAILED webapp/website prompt.

EVERY PROMPT MUST INCLUDE:
1. PAGES: All pages with their purpose (landing, auth, dashboard, etc.)
2. FEATURES: Authentication, database, core functionality
3. DESIGN: Colors (hex), fonts, spacing, dark/light mode
4. COMPONENTS: Navbar, hero, features section, footer, cards, buttons, forms
5. ANIMATIONS: Hover effects, transitions, scroll animations
6. RESPONSIVE: Mobile, tablet, desktop behaviors

STRUCTURE YOUR OUTPUT AS ONE FLOWING PARAGRAPH:
"Build a [type] with: [pages list]. Features include [functionality]. Design uses [colors and typography]. Layout has [specific sections with details]. Animations include [specific effects]. Responsive with [mobile considerations]."

${categoryContext}

EXAMPLE INPUT: "recipe app"
EXAMPLE OUTPUT: "Build a modern recipe sharing webapp with: Landing page featuring hero with food imagery and search bar, featured recipes grid, category filters, and newsletter signup; Auth pages with email/Google login using Supabase; Recipe detail page with ingredients list, step-by-step instructions, nutrition info, and comment section; User dashboard with saved recipes, uploaded recipes, and profile settings; Recipe creation page with image upload, ingredient inputs with quantity/unit fields, and step editor. Features include recipe search with filters for cuisine/diet/time, user favorites and collections, recipe ratings and reviews, social sharing, and print-friendly view. Design uses warm dark theme with #1a1a1a background, orange accent #f97316, Poppins font family, and high-quality food photography placeholders. Navbar is fixed with blur backdrop, logo left, search center, auth buttons right. Hero section has large headline 'Discover Delicious Recipes', category pills, and trending recipes carousel. Recipe cards show image, title, rating, cook time, and save button with heart icon animation on hover. All interactions have smooth 200ms transitions, cards lift on hover with subtle shadow, and page transitions use fade effects."

CRITICAL: Write as ONE paragraph. Be specific. Include everything needed to build.

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
