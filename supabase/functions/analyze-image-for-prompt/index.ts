import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const imageAnalysisSchema = z.object({
  image: z.string()
    .min(1, "Image data is required")
    .refine(
      (val) => val.startsWith('data:image/'),
      "Must be a valid image data URL"
    )
    .refine(
      (val) => val.length < 5 * 1024 * 1024, // 5MB in base64
      "Image too large (max 5MB)"
    )
});

// JSON structure for structured analysis
interface ImageAnalysisJSON {
  subject: string;
  environment: string;
  composition: string;
  perspective_camera_angle: string;
  lighting: string;
  colors: string;
  textures_materials: string;
  style: string;
  mood: string;
  visible_text: string | null;
  fine_details: string;
  uncertainties: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validation = imageAnalysisSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { image } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting two-phase image analysis');

    // ============================================
    // PHASE 1: Image → Structured JSON Analysis
    // ============================================
    const phase1SystemPrompt = `You are an expert visual analyst specializing in precise, objective image analysis. Your task is to analyze the provided image and extract ONLY what can be directly observed, without inventing details.

Analyze the image and return a JSON object with the following structure. Be precise and honest about what you can and cannot see:

{
  "subject": "Main subject(s) and key characteristics (what is clearly visible)",
  "environment": "Background, setting, location (only if clearly identifiable)",
  "composition": "Layout, framing, arrangement of elements",
  "perspective_camera_angle": "Viewpoint, angle, distance (e.g., eye-level, bird's-eye, close-up)",
  "lighting": "Light source direction, quality (soft/hard), time of day if apparent",
  "colors": "Dominant colors and color palette (be specific)",
  "textures_materials": "Visible textures and materials (only if clearly discernible)",
  "style": "Artistic style, medium, technique (photography, painting, digital, etc.)",
  "mood": "Emotional tone, atmosphere conveyed",
  "visible_text": "Any text visible in the image (null if none)",
  "fine_details": "Specific details that are clearly visible (objects, patterns, etc.)",
  "uncertainties": ["List of things you're uncertain about or cannot clearly see"]
}

CRITICAL RULES:
- Only describe what you can actually see in the image
- If something is unclear or uncertain, add it to the "uncertainties" array
- Do NOT invent details that are not visible
- Distinguish between observations (facts) and interpretations (inferences)
- Be specific and technical where possible
- Return ONLY valid JSON, no additional text`;

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
    let analysisJSON: ImageAnalysisJSON;
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

Create a prompt that:
- Is clear and readable (user will edit it manually)
- Combines all relevant elements naturally
- Is structured for easy editing
- Mentions uncertainties only if relevant
- Is optimized for prompt generation workflows
- Length: 2-4 sentences, comprehensive but concise
- Captures all fine details and specifics from the analysis

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

