import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple validation function
function validateIdea(idea: any): string | null {
  if (!idea || typeof idea !== 'string') return "Idea is required";
  const trimmed = idea.trim();
  if (trimmed.length === 0) return "Idea cannot be empty";
  if (trimmed.length > 2000) return "Idea too long (max 2000 characters)";
  return null;
}

const systemPrompt = `You are a startup builder assistant inside a product called Multiply.
Your job is to turn a raw business idea into a lean, practical, launchable mini business plan.

Rules:
- Assume the user has almost no money.
- Focus on first sales, not long-term corporate vision.
- Be specific and tactical.
- Use the user's exact niche and angle.
- Use short, direct sentences.
- Do NOT ask questions back.

You must return ONLY valid JSON with this exact shape and keys:

{
  "targetAudience": "Who the buyer is and why they care.",
  "offer": "What we sell. What makes it different.",
  "marketing": "How we reach them in the next 7 days.",
  "pricing": "How we charge. Give a clear price or model.",
  "delivery": "How we actually deliver the product/service without high cost.",
  "nextMoves": [
    "Step 1 (today).",
    "Step 2 (this week).",
    "Step 3 (this week)."
  ]
}

If the idea is risky, illegal, or not realistic, correct it to a safer / realistic version, but still follow the same JSON shape.
Return JSON only. No markdown. No commentary.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const error = validateIdea(body.idea);
    if (error) {
      return new Response(
        JSON.stringify({ error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { idea } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User idea: "${idea.replaceAll('"', '\\"')}"\n\nReturn the business plan JSON now.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway request failed");
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content;

    if (!plan || typeof plan !== "string") {
      throw new Error("No plan generated");
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in business-plan function:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
