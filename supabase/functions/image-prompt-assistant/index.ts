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
    
    // Validate input
    const { message, currentPrompt, conversationHistory = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (trimmedMessage.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (currentPrompt && (typeof currentPrompt !== 'string' || currentPrompt.length > 3000)) {
      return new Response(
        JSON.stringify({ error: 'Current prompt too long (max 3000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!Array.isArray(conversationHistory) || conversationHistory.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Conversation history too long (max 50 messages)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are an expert AI image prompt engineer specializing in creating precise, detailed prompts for AI image generation. Your expertise includes:

**Core Competencies:**
• Visual Composition: Framing, perspective, focal points, depth of field
• Artistic Styles: Photography styles, painting techniques, digital art, concept art
• Technical Details: Camera angles, lens types, lighting setups, resolution
• Mood & Atmosphere: Color palettes, emotional tone, time of day, weather
• Detail Enhancement: Textures, materials, specific objects, character details

**Prompt Structure Best Practices:**
1. Subject Description: Main focus with specific details
2. Style & Medium: Art style, photography type, rendering quality
3. Composition: Camera angle, framing, perspective
4. Lighting: Type, direction, quality (soft/hard), color temperature
5. Colors & Palette: Dominant colors, color harmony, saturation
6. Atmosphere: Mood, weather, time of day
7. Technical: Quality keywords (ultra detailed, 8K, professional)
8. Negative space & Background: Environmental context

**Quality Keywords to Include:**
• "highly detailed", "ultra realistic", "professional photography"
• "4K", "8K", "high resolution", "sharp focus"
• "cinematic lighting", "studio lighting", "natural lighting"
• "trending on artstation", "award winning"

**Your Task:**
Help users create perfect image prompts by:
1. Analyzing their current prompt/idea
2. Asking clarifying questions about missing details
3. Suggesting specific improvements
4. Providing enhanced prompts with all necessary details
5. Being extremely precise and technical

Always provide the improved prompt in a clear, copyable format.
Current user prompt: ${currentPrompt || "None yet"}`;

    console.log('Processing image prompt assistance request');

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;
    
    if (!assistantMessage) {
      console.error('No message in response:', data);
      throw new Error('No response from AI');
    }

    // Try to extract improved prompt if it's clearly marked
    let improvedPrompt = null;
    const promptMatch = assistantMessage.match(/(?:improved prompt|final prompt|enhanced prompt):\s*["'](.+?)["']/is) ||
                       assistantMessage.match(/```\n(.+?)\n```/s);
    
    if (promptMatch) {
      improvedPrompt = promptMatch[1].trim();
    }

    console.log('Image prompt assistance successful');

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        improvedPrompt: improvedPrompt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in image-prompt-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
