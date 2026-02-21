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
    console.log("Unauthorized request to analyze-image-for-prompt");
    return createUnauthorizedResponse(corsHeaders, authError || "Authentication required");
  }

  try {
    const body = await req.json();
    const image = body.image;
    
    // Manual validation
    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!image.startsWith('data:image/')) {
      return new Response(
        JSON.stringify({ error: "Must be a valid image data URL" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (image.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large (max 5MB)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting comprehensive image analysis for prompt generation');

    // ============================================
    // PHASE 1: Deep Visual Analysis
    // ============================================
    const phase1SystemPrompt = `You are an expert UI/UX designer and front-end developer with exceptional attention to visual detail. Your task is to analyze the provided image with extreme precision.

FIRST, determine what type of image this is:
1. **Website/Landing Page**: Screenshots of websites, landing pages, hero sections, web interfaces
2. **UI/App Design**: Mobile apps, desktop apps, software interfaces, dashboards
3. **Regular Image**: Photos, artwork, illustrations, graphics

For WEBSITES/LANDING PAGES, provide exhaustive analysis:

**LAYOUT & STRUCTURE:**
- Exact section breakdown (header, hero, features, testimonials, pricing, footer, etc.)
- Grid system used (columns, gaps, alignment)
- Spacing patterns (padding, margins between sections)
- Responsive indicators if visible

**HERO SECTION (if present):**
- Headline text style (size, weight, font family feel)
- Subheadline/description styling
- CTA button(s): color, shape, text, size, hover states if visible
- Background treatment (solid, gradient, image, video, pattern, overlay)
- Any decorative elements (shapes, illustrations, icons)

**NAVIGATION:**
- Logo placement and style
- Menu items layout
- CTA in navigation
- Mobile menu indicators

**COLOR PALETTE (be VERY specific):**
- Primary brand color (describe exact shade)
- Secondary colors
- Background colors (main, sections, cards)
- Text colors (headings, body, muted)
- Accent/highlight colors

**TYPOGRAPHY:**
- Heading font style (serif, sans-serif, modern, classic, bold, light)
- Body text style
- Font size hierarchy
- Line height and letter spacing feel

**VISUAL ELEMENTS:**
- Images/illustrations style (photography, 3D, flat, gradient, isometric)
- Icons style (line, filled, colorful, monochrome)
- Shadows and depth (flat, subtle, prominent)
- Border radius patterns (sharp, slightly rounded, very rounded, pill-shaped)
- Decorative elements (blobs, gradients, patterns, lines, dots)

**COMPONENTS:**
- Cards styling
- Buttons variations
- Form inputs if present
- Social proof elements
- Trust badges/logos

Return a comprehensive JSON object with ALL these details:
{
  "image_type": "website" | "ui_design" | "regular_image",
  "overall_style": "Describe the overall design aesthetic (minimal, bold, corporate, playful, luxury, tech, etc.)",
  "layout": {
    "sections": ["List each section in order with brief description"],
    "grid_pattern": "Describe the grid/column layout",
    "spacing": "Describe spacing patterns"
  },
  "hero": {
    "headline_style": "Describe headline typography",
    "subheadline": "Describe subheadline if present",
    "cta_buttons": "Describe all CTA buttons in detail",
    "background": "Describe background treatment in detail",
    "decorative_elements": "Describe any decorative elements"
  },
  "navigation": {
    "style": "Describe navigation layout and style",
    "logo": "Describe logo placement/style",
    "items": "Describe menu items and CTA"
  },
  "colors": {
    "primary": "Primary brand color (be specific like 'deep purple #6B46C1' or 'bright coral')",
    "secondary": "Secondary colors",
    "background": "Background colors",
    "text": "Text colors hierarchy",
    "accents": "Accent colors"
  },
  "typography": {
    "headings": "Heading font description",
    "body": "Body text description",
    "hierarchy": "Size/weight hierarchy"
  },
  "visual_elements": {
    "images_style": "Photo/illustration style",
    "icons": "Icon style",
    "shadows": "Shadow usage",
    "borders": "Border radius patterns",
    "decorations": "Decorative elements like blobs, patterns, gradients"
  },
  "components": "Describe key UI components and their styling",
  "mood": "Overall mood and feel",
  "unique_features": "Any standout or unique design elements"
}

Be EXTREMELY specific and detailed. The goal is to capture EVERY visual detail so the design can be precisely recreated.`;


    const phase1Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: phase1SystemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and return the structured JSON analysis.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!phase1Response.ok) {
      const errorText = await phase1Response.text();
      console.error('Phase 1 AI Gateway error:', phase1Response.status, errorText);
      
      if (phase1Response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (phase1Response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`Phase 1 AI Gateway error: ${phase1Response.status}`);
    }

    const phase1Data = await phase1Response.json();
    const phase1Content = phase1Data.choices?.[0]?.message?.content;
    
    if (!phase1Content) {
      throw new Error('No response from Phase 1 analysis');
    }

    // Parse JSON from response (handle cases where response might be wrapped)
    let analysisJSON: Record<string, unknown>;
    try {
      // Try to extract JSON if wrapped in markdown or text
      const jsonMatch = phase1Content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : phase1Content;
      analysisJSON = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Phase 1 JSON:', phase1Content);
      throw new Error('Failed to parse structured analysis');
    }

    console.log('Phase 1 completed, structured analysis:', analysisJSON);

    // ============================================
    // PHASE 2: JSON → Actionable Implementation Prompt
    // ============================================
    const isWebsite = analysisJSON.image_type === 'website' || analysisJSON.image_type === 'ui_design';
    
    const phase2SystemPrompt = isWebsite 
      ? `You are an expert front-end developer and prompt engineer. Transform this detailed visual analysis into a comprehensive, actionable prompt that can be used to EXACTLY recreate this landing page/website.

The prompt must be structured as clear implementation instructions that describe:
1. **Overall Design Direction**: Style, mood, aesthetic approach
2. **Layout Structure**: Exact sections in order, grid layout, spacing
3. **Hero Section**: Headline styling, CTAs, background treatment, decorative elements
4. **Color Scheme**: Specific colors for backgrounds, text, buttons, accents
5. **Typography**: Font styles for headings and body, size hierarchy
6. **Visual Elements**: Image/icon styles, shadows, borders, decorative elements
7. **Key Components**: How cards, buttons, forms, etc. should look
8. **Special Features**: Any unique or standout design elements

FORMAT: Write the prompt as if you're instructing a developer to build this exact design. Be specific with colors, spacing, font styles, and all visual details. The goal is that someone reading this prompt can recreate the design with high fidelity.

LENGTH: 6-12 sentences covering ALL visual aspects comprehensively.

Return ONLY the implementation prompt, no explanations or meta-commentary.`
      : `You are an expert prompt engineer. Transform this structured image analysis into a clear, detailed prompt that can recreate the image.

The prompt should describe:
- Main subject and composition
- Colors, lighting, and atmosphere
- Style and artistic approach
- Key details and elements

LENGTH: 3-6 sentences that fully capture the image.

Return ONLY the prompt text, nothing else.`;

    const phase2Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: phase2SystemPrompt
          },
          {
            role: 'user',
            content: `Transform this detailed visual analysis into a comprehensive implementation prompt that captures EVERY design detail for precise recreation:\n\n${JSON.stringify(analysisJSON, null, 2)}`
          }
        ]
      }),
    });

    if (!phase2Response.ok) {
      const errorText = await phase2Response.text();
      console.error('Phase 2 AI Gateway error:', phase2Response.status, errorText);
      
      if (phase2Response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (phase2Response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`Phase 2 AI Gateway error: ${phase2Response.status}`);
    }

    const phase2Data = await phase2Response.json();
    const finalPrompt = phase2Data.choices?.[0]?.message?.content;
    
    if (!finalPrompt) {
      throw new Error('No prompt generated in Phase 2');
    }

    console.log('Phase 2 completed, final prompt generated');

    return new Response(
      JSON.stringify({ 
        prompt: finalPrompt.trim(),
        // Optionally include structured analysis for debugging/transparency
        analysis: analysisJSON 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-image-for-prompt function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An internal error occurred. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});



