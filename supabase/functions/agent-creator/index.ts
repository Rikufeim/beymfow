import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation helper
const validateInput = (body: any): { valid: boolean; error?: string; data?: any } => {
  if (!body.optimizedPrompt || typeof body.optimizedPrompt !== 'string') {
    return { valid: false, error: "Prompt is required and must be a string" };
  }
  const trimmed = body.optimizedPrompt.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Prompt cannot be empty" };
  }
  if (trimmed.length > 10000) {
    return { valid: false, error: "Prompt too long (max 10000 characters)" };
  }
  if (body.mode && (typeof body.mode !== 'string' || body.mode.length > 50)) {
    return { valid: false, error: "Mode must be a string with max 50 characters" };
  }
  return { 
    valid: true, 
    data: { 
      optimizedPrompt: trimmed, 
      mode: body.mode 
    } 
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Agent Creator function called");

  try {
    const body = await req.json();
    
    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { optimizedPrompt, mode } = validation.data!;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI for content creation, mode:", mode);

    const systemPrompt = `You are the Creator Agent (Producer). Input: the READY-TO-USE prompt from the Refine Agent.
Goal: execute that prompt and produce the final deliverable now.
Rules:
- Follow the prompt exactly.
- Prefer numbered structure, skimmable headings, and copy that is immediately usable.
- If mode=Crypto, keep claims verifiable and utility-first; no financial advice.
Return ONLY the final deliverable content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: optimizedPrompt }
        ],
        temperature: 0.9,
        max_tokens: 4000,
        stream: true,
      }),
    });

    console.log("AI stream response status:", response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    console.log("Returning stream to client");

    // Return the streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in agent-creator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
