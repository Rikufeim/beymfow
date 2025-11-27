import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation function
function validateInput(body: any) {
  const errors: string[] = [];
  
  if (!body.userGoal || typeof body.userGoal !== 'string') {
    errors.push("Goal is required");
  } else if (body.userGoal.trim().length === 0) {
    errors.push("Goal cannot be empty");
  } else if (body.userGoal.length > 2000) {
    errors.push("Goal too long");
  }
  
  if (body.context && typeof body.context === 'string' && body.context.length > 5000) {
    errors.push("Context too long");
  }
  
  if (body.categories && (!Array.isArray(body.categories) || body.categories.length > 10)) {
    errors.push("Invalid categories");
  }
  
  if (body.timeframeDays && (!Number.isInteger(body.timeframeDays) || body.timeframeDays < 1 || body.timeframeDays > 365)) {
    errors.push("Invalid timeframe");
  }
  
  return errors;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Agent Input function called");

  try {
    const body = await req.json();
    
    // Validate input
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: validationErrors[0] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { userGoal, context, categories, mode, timeframeDays, expertTone } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI with mode:", mode);

    const systemPrompt = `You are the Input Agent (Collector) inside Multiply. Goal: turn a messy brief into a clean, structured spec for the next agent.
Steps:
1) Read userGoal, context, categories, mode, timeframeDays, expertTone.
2) Ask yourself what's missing; infer obvious defaults.
3) Produce a compact JSON spec with keys:
{
 "mode": "Business" | "Crypto",
 "persona": "...",
 "objective": "...",
 "audience": "...",
 "tone": "...",
 "constraints": ["..."],
 "style": ["..."],
 "timeframe_days": <int>,
 "deliverable_type": "post | thread | script | hook | ad | landing | research | image_prompt | mockup_prompt | other",
 "success_criteria": ["..."],
 "keywords": ["..."],
 "rivals_or_refs": ["..."]
}
Rules:
- If mode=Crypto, prefer XRP/HBAR/XLM utilities, ISO 20022 context, and real-world use cases over pure price talk.
- Keep it factual but pragmatic; no hype unless explicitly requested.
- If categories include Image Creation or Product Mockups, set deliverable_type accordingly.
Return ONLY the JSON. No extra text.`;

    const userMessage = `Mode: ${mode}
Categories: ${categories.join(', ')}
User Goal: ${userGoal}
Context: ${context}
Timeframe Days: ${timeframeDays}
Expert Tone: ${expertTone}

Generate the structured JSON spec now.`;

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
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log("AI response status:", response.status);

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

    const data = await response.json();
    console.log("AI response received");
    const content = data.choices[0].message.content;
    console.log("Content length:", content.length);
    
    // Try to parse JSON from the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to find JSON in content:", content.substring(0, 200));
      throw new Error("Failed to extract JSON from response");
    }
    
    const specJSON = JSON.parse(jsonMatch[0]);
    console.log("Parsed spec JSON successfully");

    return new Response(
      JSON.stringify({ spec: specJSON }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in agent-input:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
