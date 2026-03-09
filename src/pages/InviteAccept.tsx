import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { lovable } from "@/integrations/lovable";

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "auth_required">("loading");
  const [message, setMessage] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    // Store token for after auth
    if (token) {
      sessionStorage.setItem("pending_invite_token", token);
    }
  }, [token]);

  useEffect(() => {
    const acceptInvite = async () => {
      if (authLoading) return;

      if (!user) {
        setStatus("auth_required");
        setMessage("Please sign in to accept this invitation");
        return;
      }

      if (!token) {
        setStatus("error");
        setMessage("Invalid invite link");
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke("accept-invite", {
          body: { token },
          headers: {
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to accept invite");
        }

        const data = response.data;
        
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
          setTeamName(data.teamName || "the team");
          sessionStorage.removeItem("pending_invite_token");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to accept invite");
        }
      } catch (err: any) {
        console.error("Accept invite error:", err);
        setStatus("error");
        setMessage(err.message || "Something went wrong");
      }
    };

    acceptInvite();
  }, [user, authLoading, token]);

  const handleSignIn = async () => {
    // Redirect to auth page with return URL
    const returnUrl = `/invite/${token}`;
    sessionStorage.setItem("auth_redirect_after", returnUrl);
    navigate("/auth");
  };

  const handleGoogleSignIn = async () => {
    const returnUrl = `/invite/${token}`;
    sessionStorage.setItem("auth_redirect_after", returnUrl);
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/invite/${token}`,
    });
  };

  const handleGoToFlow = () => {
    navigate("/flow");
  };

  return (
    <>
      <SEOHead
        pathname={`/invite/${token}`}
        overrides={{
          title: "Accept Invitation — Beymflow",
          description: "Join your team on Beymflow",
        }}
      />
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-400" />
              <p className="text-neutral-400">Processing invitation...</p>
            </>
          )}

          {status === "auth_required" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-2xl font-semibold">You're invited to join a team</h1>
              <p className="text-neutral-400">{message}</p>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-neutral-900 hover:bg-neutral-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  className="w-full border-white/10 hover:bg-white/5"
                >
                  Sign in with email
                </Button>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-semibold">Welcome to {teamName}!</h1>
              <p className="text-neutral-400">{message}</p>
              <Button
                onClick={handleGoToFlow}
                className="bg-purple-600 hover:bg-purple-700 mt-4"
              >
                Go to Flow
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-semibold">Invitation Error</h1>
              <p className="text-neutral-400">{message}</p>
              <Button
                onClick={handleGoToFlow}
                variant="outline"
                className="border-white/10 hover:bg-white/5 mt-4"
              >
                Go to Flow
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InviteAccept;
