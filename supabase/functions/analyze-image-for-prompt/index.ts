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

    console.log('Starting two-phase image analysis');

    // ============================================
    // PHASE 1: Image → Structured JSON Analysis
    // ============================================
    const phase1SystemPrompt = `You are an expert visual analyst. Your task is to analyze the provided image and understand what kind of content it represents.

FIRST, determine what type of image this is:
1. **Website/Landing Page Screenshot**: If this is a screenshot of a website, landing page, hero section, or web interface
2. **UI/App Design**: If this is a mobile app, desktop app, or software interface
3. **Regular Image**: Photos, artwork, illustrations, graphics, etc.

For WEBSITES/LANDING PAGES/UI, your analysis should focus on:
- Layout structure and sections visible
- Design style (modern, minimal, corporate, playful, etc.)
- Color scheme and typography choices
- Key features and elements (hero, CTA buttons, navigation, forms, etc.)
- Content type and messaging style
- Any specific patterns or components used

For REGULAR IMAGES, analyze:
- Main subject(s) and key characteristics
- Environment/background setting
- Composition and framing
- Lighting and colors
- Style and mood

Return a JSON object with this structure:
{
  "image_type": "website" | "ui_design" | "regular_image",
  "subject": "Main subject/purpose of the image",
  "design_elements": "Key design elements, layout, and structure",
  "style": "Visual style, aesthetic, design approach",
  "colors": "Color palette and scheme",
  "key_features": "Important features, sections, or components",
  "mood": "Overall feel and atmosphere",
  "technical_details": "Any technical or implementation-relevant details",
  "purpose": "What this content is trying to achieve"
}

CRITICAL: Be specific about what you observe. If it's a landing page, describe the actual sections and elements visible.`;


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
    // PHASE 2: JSON → Final Prompt
    // ============================================
    const phase2SystemPrompt = `You are an expert prompt engineer. Your task is to transform a structured image analysis into a clear, effective, and editable text prompt.

The structured analysis contains:
- Subject, environment, composition, perspective
- Lighting, colors, textures, style
- Mood, details, and any uncertainties

Create a prompt that can be used to RECREATE the content of the image.
If "image_type" is "website" or "ui_design", the prompt MUST describe a full landing page or UI so that a website generator can rebuild it as closely as possible.
It should specify:
- Layout sections (hero, navigation, content blocks, footers, sidebars, etc.)
- Component hierarchy and placement
- Typography (font feel, sizes, weights, hierarchy)
- Color palette and background treatments
- Imagery style and iconography
- Call-to-action buttons and conversion elements
- Overall style, brand mood, and interaction feel
For regular images, create a prompt that fully describes the scene for an image generator.
The prompt must be clear, readable, and easy to edit.
Length: 3-6 sentences, comprehensive but concise.
Return ONLY the prompt text, nothing else.`;

    const phase2Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Faster model for text transformation
        messages: [
          {
            role: 'system',
            content: phase2SystemPrompt
          },
          {
            role: 'user',
            content: `Transform this structured image analysis into a clear, editable prompt that captures all details:\n\n${JSON.stringify(analysisJSON, null, 2)}`
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
        error: error instanceof Error ? error.message : 'Failed to analyze image' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

