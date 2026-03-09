-- Create team_role enum
CREATE TYPE public.team_role AS ENUM ('owner', 'member');

-- Create teams table (one team per owner)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Team',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id)
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

-- Create partial unique index for pending invites
CREATE UNIQUE INDEX idx_team_invites_pending_unique 
  ON public.team_invites(team_id, invited_email) 
  WHERE status = 'pending';

-- Create index for fast token lookups
CREATE INDEX idx_team_invites_token ON public.team_invites(token) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is team owner
CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND owner_id = _user_id
  )
$$;

-- Helper function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id
  )
$$;

-- Helper function to get team member count
CREATE OR REPLACE FUNCTION public.get_team_member_count(_team_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.team_members WHERE team_id = _team_id
$$;

-- RLS policies for teams table
CREATE POLICY "Users can view teams they own or are members of"
  ON public.teams FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    public.is_team_member(auth.uid(), id)
  );

CREATE POLICY "Users can create their own team"
  ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only owners can update their team"
  ON public.teams FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Only owners can delete their team"
  ON public.teams FOR DELETE
  USING (owner_id = auth.uid());

-- RLS policies for team_members table
CREATE POLICY "Team members can view other members"
  ON public.team_members FOR SELECT
  USING (
    public.is_team_owner(auth.uid(), team_id) OR 
    public.is_team_member(auth.uid(), team_id)
  );

CREATE POLICY "Only owners can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (public.is_team_owner(auth.uid(), team_id));

CREATE POLICY "Only owners can remove members"
  ON public.team_members FOR DELETE
  USING (public.is_team_owner(auth.uid(), team_id));

-- RLS policies for team_invites table
CREATE POLICY "Team members can view invites"
  ON public.team_invites FOR SELECT
  USING (
    public.is_team_owner(auth.uid(), team_id) OR 
    public.is_team_member(auth.uid(), team_id)
  );

CREATE POLICY "Only owners can create invites"
  ON public.team_invites FOR INSERT
  WITH CHECK (
    public.is_team_owner(auth.uid(), team_id) AND
    public.get_team_member_count(team_id) < 4
  );

CREATE POLICY "Only owners can revoke invites"
  ON public.team_invites FOR UPDATE
  USING (public.is_team_owner(auth.uid(), team_id));

-- Trigger to auto-add owner as team member when team is created
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_owner_as_member();

-- Updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();