import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface AuthResult {
  user: { id: string; email?: string } | null;
  error: string | null;
}

export async function validateAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { user: null, error: "Authentication required" };
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    return { user: null, error: "Invalid authorization header" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables not configured");
    return { user: null, error: "Server configuration error" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.log("Auth validation failed:", error?.message);
    return { user: null, error: "Invalid or expired token" };
  }

  return { user: { id: user.id, email: user.email }, error: null };
}

export function createUnauthorizedResponse(corsHeaders: Record<string, string>, message: string = "Authentication required"): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 401, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}
