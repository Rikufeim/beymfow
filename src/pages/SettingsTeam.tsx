import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Mail, Trash2, UserMinus, Crown, User, Loader2, Copy, Check } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  email?: string;
}

interface TeamInvite {
  id: string;
  invited_email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

const SettingsTeam = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const MAX_MEMBERS = 4;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      loadTeamData();
    }
  }, [user, authLoading]);

  const loadTeamData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get user's team (either owned or member of)
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      let currentTeam = teamData;

      // If no owned team, check if user is a member of another team
      if (!currentTeam) {
        const { data: membershipData } = await supabase
          .from("team_members")
          .select("team_id, teams(*)")
          .eq("user_id", user.id)
          .single();

        if (membershipData?.teams) {
          currentTeam = membershipData.teams as unknown as Team;
        }
      }

      if (currentTeam) {
        setTeam(currentTeam);
        setIsOwner(currentTeam.owner_id === user.id);

        // Get members with emails
        const { data: membersData } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", currentTeam.id);

        if (membersData) {
          // Fetch emails for members
          const membersWithEmails = await Promise.all(
            membersData.map(async (member) => {
              // We can't directly query auth.users, so we'll show the role
              return {
                ...member,
                email: member.user_id === user.id ? user.email : "Team member",
              };
            })
          );
          setMembers(membersWithEmails);
        }

        // Get pending invites (only for owner)
        if (currentTeam.owner_id === user.id) {
          const { data: invitesData } = await supabase
            .from("team_invites")
            .select("*")
            .eq("team_id", currentTeam.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

          if (invitesData) {
            setInvites(invitesData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user) return;

    const totalSeats = members.length + invites.length;
    if (totalSeats >= MAX_MEMBERS) {
      toast.error("Team is full (max 4 members)");
      return;
    }

    setInviting(true);
    try {
      const { data: session } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke("team-invite", {
        body: { email: inviteEmail.trim().toLowerCase() },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.success) {
        toast.success("Invite sent!", {
          description: `Invitation created for ${inviteEmail}`,
        });
        setInviteEmail("");
        
        // Show invite URL to copy
        if (data.inviteUrl) {
          setCopiedUrl(data.inviteUrl);
          navigator.clipboard.writeText(data.inviteUrl);
          toast.info("Invite link copied to clipboard", {
            description: "Share this link with your teammate",
          });
        }
        
        loadTeamData();
      } else {
        toast.error(data.error || "Failed to send invite");
      }
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from("team_invites")
        .update({ status: "revoked" })
        .eq("id", inviteId);

      if (error) throw error;
      toast.success("Invite revoked");
      loadTeamData();
    } catch (error) {
      console.error("Error revoking invite:", error);
      toast.error("Failed to revoke invite");
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      toast.error("You cannot remove yourself");
      return;
    }

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Member removed");
      loadTeamData();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const seatsUsed = members.length;
  const pendingCount = invites.length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        pathname="/settings/team"
        overrides={{
          title: "Team Settings — Beymflow",
          description: "Manage your team members and invitations",
        }}
      />
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Team</h1>
        </header>

        <main className="max-w-2xl mx-auto px-6 md:px-10 py-12 space-y-10">
          {/* Team Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{team?.name || "My Team"}</h2>
                <p className="text-sm text-neutral-400">
                  {seatsUsed} / {MAX_MEMBERS} seats used
                  {pendingCount > 0 && ` · ${pendingCount} pending`}
                </p>
              </div>
            </div>
            {isOwner && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Owner
              </Badge>
            )}
          </div>

          {/* Invite Section (Owner only) */}
          {isOwner && seatsUsed < MAX_MEMBERS && (
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-300">Invite teammate</h3>
              <form onSubmit={handleInvite} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 focus:border-purple-500/50"
                  disabled={inviting}
                />
                <Button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {inviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </form>
              {seatsUsed + pendingCount >= MAX_MEMBERS && (
                <p className="text-sm text-amber-400">
                  Maximum team size reached (4 members)
                </p>
              )}
            </section>
          )}

          {/* Team Members */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-300">Team members</h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center">
                      {member.role === "owner" ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : (
                        <User className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        {member.user_id === user?.id ? "You" : member.email}
                      </p>
                      <p className="text-xs text-neutral-500 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {isOwner && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id, member.user_id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pending Invites (Owner only) */}
          {isOwner && invites.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-300">Pending invites</h3>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-200">
                          {invite.invited_email}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = `${window.location.origin}/invite/${invite.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Invite link copied");
                        }}
                        className="text-neutral-400 hover:text-neutral-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Team State */}
          {!team && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
              <p className="text-neutral-400">
                You don't have a team yet. Create one by inviting your first teammate.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default SettingsTeam;
