import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client for user context
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email } = await req.json() as InviteRequest;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get or create user's team
    let { data: team, error: teamError } = await supabaseUser
      .from('teams')
      .select('id, name, owner_id')
      .eq('owner_id', user.id)
      .single();

    if (!team) {
      // Create team for user
      const { data: newTeam, error: createError } = await supabaseUser
        .from('teams')
        .insert({ owner_id: user.id, name: 'My Team' })
        .select()
        .single();

      if (createError) {
        console.error('Error creating team:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create team' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      team = newTeam;
    }

    // Check if user is owner
    if (team.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Only team owners can send invites' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check team capacity (max 4 members)
    const { count: memberCount } = await supabaseAdmin
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    if (memberCount && memberCount >= 4) {
      return new Response(
        JSON.stringify({ error: 'Team is full (max 4 members)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is already a member
    const { data: existingUserData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUserData?.users?.find(u => u.email === email.toLowerCase());
    
    if (existingUser) {
      const { data: existingMember } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'This person is already a team member' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabaseAdmin
      .from('team_invites')
      .select('id, expires_at')
      .eq('team_id', team.id)
      .eq('invited_email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      const expiresAt = new Date(existingInvite.expires_at);
      if (expiresAt > new Date()) {
        return new Response(
          JSON.stringify({ error: 'An invite is already pending for this email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Expire old invite
      await supabaseAdmin
        .from('team_invites')
        .update({ status: 'expired' })
        .eq('id', existingInvite.id);
    }

    // Create new invite with secure token
    const token = crypto.randomUUID() + '-' + crypto.randomUUID();
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .insert({
        team_id: team.id,
        invited_email: email.toLowerCase(),
        invited_by: user.id,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invite' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the app URL from request origin or use default
    const origin = req.headers.get('origin') || 'https://testerbeym.lovable.app';
    const inviteUrl = `${origin}/invite/${token}`;

    // For now, return invite info (email sending can be added later via Resend)
    // The invite URL can be shared manually or via email integration
    console.log(`Invite created for ${email}: ${inviteUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invite created successfully',
        inviteUrl,
        invite: {
          id: invite.id,
          email: invite.invited_email,
          expiresAt: invite.expires_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in team-invite:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
