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

  // Try to authenticate, but allow guest access
  const { user } = await validateAuth(req);
  // user may be null for guest users – that's OK

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
    const promptType = body.promptType || 'chatgpt'; // chatgpt is now default
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

    // Model selection: fast = instant quality (lightweight model), advanced = deep, premium = maximum
    const selectedModel = model === 'premium' 
      ? 'openai/gpt-5'
      : model === 'advanced' 
      ? 'google/gemini-2.5-pro' 
      : 'google/gemini-2.5-flash-lite';
    
    const isFast = model === 'fast';
    const isAdvanced = model === 'advanced';
    const isPremium = model === 'premium';

    // Category-specific context
    const categoryContext = category ? `\n\nDOMAIN FOCUS: This prompt is for the ${category.toUpperCase()} domain. ${
      category === 'creativity' ? 'Apply deep creative expertise: aesthetic theory, artistic movements, design thinking, innovation frameworks. Reference specific techniques, styles, or methodologies.' :
      category === 'personal' ? 'Apply behavioral psychology, habit science, cognitive frameworks, and evidence-based self-improvement methodologies. Be specific about techniques and measurable outcomes.' :
      category === 'business' ? 'Apply business strategy frameworks (Porter, Blue Ocean, Lean), market intelligence, competitive analysis, and revenue optimization. Include specific KPIs and metrics.' :
      'Apply deep crypto/DeFi/Web3 expertise: tokenomics, on-chain analysis, protocol mechanics, risk frameworks, and regulatory considerations. Be technically precise.'
    }` : '';

    const hasImages = images.length > 0;
    const imageCount = images.length;

    const imageSystemPrompt = isPremium
      ? `You are a world-class web design and UX specialist with expertise in visual analysis, brand identity, and conversion-optimized landing page design. Analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} and create a comprehensive prompt for generating a similar landing page.${categoryContext}

Premium Landing Page Analysis:
${imageCount > 1 ? '- Analyze all images holistically' : ''}
- Layout structure, color palette, typography, spacing, visual hierarchy
- Hero sections, CTAs, navigation, content sections, imagery style
- Brand identity: tone, style, mood, target audience
- Technical: responsive patterns, interactions, animations
- Conversion: CTA placement, trust signals, value propositions
${imageCount > 1 ? '- Synthesize into cohesive design specification' : ''}
- 4-6 sentences. Return only the prompt.`
      : `You are an expert web designer. Analyze the provided ${imageCount > 1 ? `${imageCount} images` : 'image'} and create a detailed landing page prompt.${categoryContext}

${imageCount > 1 ? '- Consider all images together' : ''}
- Layout, colors, typography, spacing, visual elements
- Sections: hero, navigation, content, CTAs, footer
- Brand identity: style, mood, tone
- 2-4 sentences. Return only the prompt.`;

    // ═══════════════════════════════════════════════════════════════
    // CONTEXT EXPANSION ENGINE
    // ═══════════════════════════════════════════════════════════════
    const contextExpansionBlock = `
CONTEXT EXPANSION ENGINE (apply BEFORE writing the prompt):
When the user provides a short or vague idea, you MUST silently expand it by inferring:
1. TARGET AUDIENCE — Who specifically? (e.g. "solopreneurs aged 25-40" not "people")
2. GOAL — What concrete outcome? (e.g. "a 90-day launch roadmap" not "some plan")
3. INDUSTRY/DOMAIN — What specific field? (e.g. "B2B SaaS" not "business")
4. OUTPUT FORMAT — What deliverable shape? (e.g. "step-by-step action plan with milestones" not "list")
5. CONSTRAINTS — What rules? (e.g. "professional tone, under 2000 words, actionable" not nothing)
Never ask the user for these. Infer them intelligently and produce a complete prompt.`;

    // ═══════════════════════════════════════════════════════════════
    // ANTI-GENERIC RULES
    // ═══════════════════════════════════════════════════════════════
    const antiGenericRules = `
ANTI-GENERIC RULES (ABSOLUTE — violating these is a failure):
- NEVER start with "Write something about...", "Explain...", "Give ideas...", "Help me with...", "Create a...", "Tell me about..."
- NEVER produce prompts that could apply to ANY topic — every prompt must be specific to the user's subject
- NEVER use filler phrases without concrete instructions backing them
- ALWAYS include a specific expert ROLE with credentials/expertise area
- ALWAYS include concrete deliverable format (not just "provide information")
- ALWAYS include at least 2 constraints (tone, length, framework, audience, etc.)
- ALWAYS reference domain-specific frameworks, methodologies, or techniques when applicable
- The prompt must feel like it was written by a $500/hour prompt engineering consultant`;

    // ═══════════════════════════════════════════════════════════════
    // STRUCTURED OUTPUT FORMAT — tiered by model
    // ═══════════════════════════════════════════════════════════════
    const structuredFormat = isFast
      ? `OUTPUT STRUCTURE (Fast — compressed but high-signal):
Write the prompt as ONE dense paragraph embedding:
• Expert role (1 phrase) • Specific task with concrete deliverable (1-2 sentences) • Output format + 1-2 constraints (1 sentence)
Total: 3-5 sentences. Every word must carry meaning. No filler.`
      : isAdvanced
      ? `OUTPUT STRUCTURE (Advanced — deep structured prompt):
Write the prompt embedding ALL of these as a flowing multi-paragraph prompt:
ROLE: "Act as [specific expert with 15+ years experience in X]"
CONTEXT: Background situation, assumptions, target audience, why this matters
TASK: Exact deliverable with step-by-step methodology. Reference frameworks (Porter, AIDA, Jobs-to-Be-Done, etc.)
CONSTRAINTS: Tone, length, structure rules, what to avoid, what to prioritize
OUTPUT FORMAT: Exact shape (numbered steps, table with columns X/Y/Z, executive brief, etc.)
Total: 6-10 sentences. Dense with specifics.`
      : `OUTPUT STRUCTURE (Premium — expert-grade production prompt):
Write a masterclass-level prompt embedding ALL:
ROLE: "You are a [world-class title] with [credentials]. You have advised [type of clients] and specialize in [exact domain]."
CONTEXT: Deep background — market conditions, audience psychographics, challenges, strategic objectives, relevant benchmarks.
TASK: Multi-phase methodology referencing named frameworks ("Apply McKinsey 7S...", "Use RICE scoring..."). Break into phases with sub-deliverables.
CONSTRAINTS: Professional tone, evidence-based reasoning, specific format rules, anti-patterns to avoid, quality benchmarks
OUTPUT FORMAT: Precise spec (e.g. "Section 1 - Market Analysis as 2x4 table; Section 2 - 90-day plan with weekly milestones; Section 3 - Risk matrix")
EXAMPLES: Brief example of expected output quality when helpful
Total: 8-15 sentences. Fortune-500-consulting-quality output.`;

    let textSystemPrompt: string;
    
    if (promptType === 'lovable') {
      textSystemPrompt = `You are "Lovable Prompt Architect" — an elite full-stack product designer and prompt engineer who creates production-ready prompts for building web applications on the Lovable platform.

${contextExpansionBlock}

YOUR MISSION: Transform the user's app idea into a precise, implementation-ready Lovable prompt. If the idea is vague, expand it into a complete product vision.

${isFast ? `FAST MODE — ONE dense paragraph:
- App type, value proposition, target user
- 3-4 core features with specific UI components
- Color palette (exact hex codes), typography, layout
- Key pages and navigation flow
3-5 sentences. No intro. Start directly.` : isAdvanced ? `ADVANCED MODE — Comprehensive build prompt:
1. PRODUCT: App type, value proposition, target persona
2. PAGES & ROUTING: Every page, navigation, protected routes
3. FEATURES: Auth, database models, CRUD, real-time, uploads, payments
4. UI/UX: Design system (dark/light, hex colors), typography, components, animations, breakpoints (375/768/1280px)
5. LAYOUT: Per-page — Header, Hero, sections, Footer
6. TECH: React + TypeScript + Vite, Tailwind + shadcn/ui, Supabase, Framer Motion
7. DATABASE: Tables, columns, relationships, RLS policies` : `PREMIUM MODE — Elite production prompt with ALL Advanced sections PLUS:
- Micro-interactions and animation choreography
- Accessibility (WCAG 2.1 AA), performance optimization
- SEO structure, edge cases, error states, onboarding flow`}

${categoryContext}

RULES: No bullets/markdown in output. ONE continuous paragraph. Include ALL design details. ALWAYS generate web app prompt.
${antiGenericRules}

Return ONLY the finished Lovable prompt.`;

    } else if (promptType === 'gemini') {
      textSystemPrompt = `You are "Lovable Prompt Architect" — an elite prompt engineer specializing in Google Gemini's strengths: advanced reasoning, multi-step analysis, and structured output.

${contextExpansionBlock}

YOUR MISSION: Transform the user's idea into a high-performance Gemini prompt. Generate TOPIC-RELEVANT prompts. "online business" → business strategy, NOT app building.

${structuredFormat}

${categoryContext}

GEMINI OPTIMIZATIONS:
- Leverage chain-of-thought reasoning with step-by-step analysis
- Request tables, comparisons, matrices for structured output
- Apply "think step by step" for complex problems
- Request evidence-based reasoning with cited frameworks

${antiGenericRules}

Return ONLY the optimized prompt.`;

    } else if (promptType === 'image') {
      textSystemPrompt = `You are "Lovable Prompt Architect" — a master of AI image generation prompts for Midjourney, DALL-E, Stable Diffusion, Flux.

${contextExpansionBlock}

YOUR MISSION: Transform any idea into a richly detailed visual prompt with specific artistic direction.

${isFast ? `FAST MODE — ONE powerful image prompt:
Subject + visual details → style → lighting/mood → quality modifiers (8k, cinematic)
No intro. Just the prompt.` : isAdvanced ? `ADVANCED MODE:
1. SUBJECT: Materials, textures, expressions, poses, scale
2. ENVIRONMENT: Background, atmosphere, weather, time, storytelling
3. STYLE: Art movement (e.g. "Baroque chiaroscuro", "Wes Anderson symmetry")
4. LIGHTING: Type, direction, color temperature, shadows
5. COMPOSITION: Camera angle, lens (85mm/24mm), depth of field
6. COLOR: Palette, accents, harmony type
7. MOOD: Emotional tone
8. TECHNICAL: 8k, masterpiece, photorealistic, render refs` : `PREMIUM MODE — ALL Advanced PLUS:
- Art historical references (specific artists/movements)
- Material micro-details, negative prompt suggestions
- Style fusion ("Studio Ghibli meets Blade Runner")
- Atmospheric particles, post-processing aesthetic`}

${categoryContext}
${antiGenericRules}

Output ONLY the image prompt. No explanations.`;

    } else if (promptType === 'chatgpt') {
      textSystemPrompt = `You are "Lovable Prompt Architect" — an elite prompt engineer for ChatGPT (GPT-4, GPT-5).

${contextExpansionBlock}

YOUR MISSION: Transform the user's idea into a high-performance ChatGPT prompt. TOPIC-RELEVANT: "online business" → business strategy, NOT app building.

${structuredFormat}

${categoryContext}

CHATGPT OPTIMIZATIONS:
- Use "Act as [specific expert]" persona framing
- Clear instruction chains leveraging conversational strengths
- Few-shot examples when they clarify expected output
- "Let's think step by step" for complex reasoning
- "Do NOT..." constraints to prevent failure modes

${antiGenericRules}

Return ONLY the optimized ChatGPT prompt.`;

    } else {
      textSystemPrompt = `You are "Lovable Prompt Architect" — an elite prompt engineer who creates expert-level prompts for any AI model. Your prompts match the quality of $500/hour domain consultants.

${contextExpansionBlock}

YOUR MISSION: Transform ANY idea into a powerful, specific, expert-grade prompt. TOPIC-RELEVANT: "online business" → business strategy. "fitness" → fitness/nutrition. NEVER default to app prompts.

${structuredFormat}

${categoryContext}

${antiGenericRules}

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
        ...(isFast ? { max_tokens: 600, temperature: 0.6 } : {}),
        ...(isAdvanced ? { temperature: 0.7 } : {}),
        ...(isPremium ? { max_tokens: 2000, temperature: 0.75 } : {}),
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
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
