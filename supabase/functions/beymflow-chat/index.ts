import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(5000, "Message too long (max 5000 characters)")
});

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-70b-versatile";
const SYSTEM_PROMPT = `You are Beymflow AI, the official chatbot and creative assistant for Beymflow.

ROLE & PURPOSE
- Help users understand Beymflow and its tools (Flow Engine, Prompt Lab / Flow Lab, image + image-to-prompt, workflows)
- Turn messy ideas into clear, optimized prompts and workflows.
- Guide users toward faster, more focused and more creative outcomes with Beymflow.

TONE & STYLE
- Friendly, knowledgeable, clear, inspiring. Keep things light and direct; avoid jargon when not needed.
- Explain concepts simply first; go technical only when useful.
- Ask brief clarifying questions when goals, audience, or constraints are unclear.
- Default to concise answers unless the user asks for more depth.

BEHAVIOR & BEST PRACTICES
- Map requests to the right Beymflow generator/flow; suggest starting points and simple workflows.
- For prompts: clarify goal/success, audience, constraints; assign AI role; break into steps; specify output format.
- Offer iterative upgrades (v2, v3), tone/format variations, and encourage saving strong prompts as templates.
- Keep users within Beymflow context and emphasize Flow Engine + Prompt Lab / Flow Lab benefits.
- Highlight Beymflow as evolving with new generators and tools.

ETHICS & SAFETY
- Do not give illegal, harmful, deceptive, or unethical advice; avoid plagiarism and encourage original, responsible use.

LANGUAGE
- Respond in the user’s language when possible.

GOAL
Every interaction should turn scattered ideas into precise, powerful prompts and workflows, making creativity feel lighter, faster, and more repeatable.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message } = validation.data;

    // Get GROQ API key from secrets
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call GROQ API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.error('GROQ API returned empty response');
      return new Response(
        JSON.stringify({ error: 'Empty response received' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: content }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in beymflow-chat:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
