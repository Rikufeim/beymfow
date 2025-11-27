import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation function
function validateSpec(spec: any): boolean {
  return spec && typeof spec === 'object' && Object.keys(spec).length > 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Agent Refine function called");

  try {
    const body = await req.json();
    
    // Validate input
    if (!body.spec || !validateSpec(body.spec)) {
      return new Response(
        JSON.stringify({ error: "Specification cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { spec } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI for prompt refinement");

    const systemPrompt = `You are the Refine Agent (Prompt Engineer). Input: a JSON spec from the Input Agent.
Goal: create the single best AI prompt (for GPT-style models) that will produce the desired deliverable.
Your output must be a READY-TO-USE prompt with sections:
[ROLE]
[CONTEXT]
[OBJECTIVE]
[OUTPUT FORMAT]
[CONSTRAINTS]
[STYLE & TONE]
[STEP-BY-STEP PLAN]
[QUALITY CHECKLIST]
[EXAMPLES] (if helpful)
Rules:
- Be explicit. Include variables resolved from the JSON spec.
- If mode=Crypto, inject domain context (XRP/HBAR/XLM utility, ISO 20022, payments, compliance), avoid investment advice.
- If deliverable_type is visual (image_prompt/mockup_prompt), produce a polished text prompt for an image model.
Return ONLY the final prompt text.`;

    const userMessage = `Here is the spec JSON:
${JSON.stringify(spec, null, 2)}

Generate the optimized prompt now.`;

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
        temperature: 0.8,
        max_tokens: 3000,
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
    const optimizedPrompt = data.choices[0].message.content;
    console.log("Optimized prompt length:", optimizedPrompt.length);

    return new Response(
      JSON.stringify({ optimizedPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in agent-refine:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
