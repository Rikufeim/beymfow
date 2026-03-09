import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, CreditCard, Palette, LogOut, ChevronRight, Check, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { user, signOut, usageInfo, loading } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/");
  };

  // User info helpers
  const getUserName = () => {
    if (!user) return "Guest";
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  };

  const getUserEmail = () => user?.email || "";

  const getAvatarUrl = () => user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  const getAvatarInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const isGoogleUser = () => {
    return user?.app_metadata?.provider === "google" || user?.identities?.some(i => i.provider === "google");
  };

  const getPlanLabel = () => {
    if (!usageInfo) return "Free";
    if (usageInfo.plan === "pro" && usageInfo.subscriptionStatus === "active") return "Pro";
    return "Free";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">Sign in to access settings</p>
        <Button onClick={() => navigate("/auth")} variant="outline">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        pathname="/settings" 
        overrides={{ 
          title: "Settings — Beymflow", 
          description: "Manage your account, security, billing, and preferences in Beymflow." 
        }} 
      />
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link to="/flow" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Flow
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Settings</h1>
        </header>

        <main className="max-w-2xl mx-auto px-6 md:px-10 py-12 space-y-12">
          
          {/* Account Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User size={16} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Account</h2>
            </div>

            {/* Profile Card */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-white/10">
                  <AvatarImage src={getAvatarUrl()} alt={getUserName()} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-300 text-lg">
                    {getAvatarInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{getUserName()}</p>
                  <p className="text-neutral-400 text-sm truncate">{getUserEmail()}</p>
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                  {getPlanLabel()}
                </Badge>
              </div>

              {/* Connected Login Methods */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-neutral-400 mb-3">Connected login methods</p>
                <div className="flex items-center gap-3">
                  {isGoogleUser() ? (
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-neutral-300">Google</span>
                      <Check size={14} className="text-green-400 ml-1" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-sm">
                      <span className="text-neutral-300">Email & Password</span>
                      <Check size={14} className="text-green-400 ml-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Lock size={16} className="text-cyan-400" />
              </div>
              <h2 className="text-lg font-semibold">Security</h2>
            </div>

            <div className="space-y-3">
              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-red-400" />
                  <span className="text-neutral-200">{signingOut ? "Signing out..." : "Sign out"}</span>
                </div>
                <ChevronRight size={16} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
              </button>

              {/* Session info */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <p className="text-sm text-neutral-400">
                  Signed in as <span className="text-neutral-200">{getUserEmail()}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users size={16} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Team</h2>
            </div>

            <Link
              to="/settings/team"
              className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-colors group"
            >
              <div>
                <p className="text-neutral-200">Team members</p>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Invite teammates to collaborate (max 4 members)
                </p>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            </Link>
          </section>

          {/* Billing Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard size={16} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold">Billing</h2>
            </div>

            <Link
              to="/settings/billing"
              className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl p-4 transition-colors group"
            >
              <div>
                <p className="text-neutral-200">Subscription</p>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {getPlanLabel() === "Pro" ? "Manage your Pro subscription" : "Upgrade to Pro for more features"}
                </p>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
            </Link>
          </section>

          {/* Preferences Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Palette size={16} className="text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
              <p className="text-sm text-neutral-400">
                Preferences will be available in a future update. You'll be able to customize your theme, default AI model, and tool preferences.
              </p>
            </div>
          </section>

        </main>
      </div>
    </>
  );
};

export default Settings;
