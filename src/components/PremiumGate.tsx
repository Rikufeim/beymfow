import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Zap, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PremiumGateProps {
  children: React.ReactNode;
}

export const PremiumGate = ({ children }: PremiumGateProps) => {
  const { user, session, usageInfo, loading } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showGate, setShowGate] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/flow");
      return;
    }

    // Check if user has premium access
    const isPremium = usageInfo?.subscriptionTier === "premium";
    
    // Show gate if not premium
    setShowGate(!isPremium);
  }, [user, usageInfo, loading, navigate]);

  const handleUpgrade = useCallback(async () => {
    if (!user || !session) {
      sessionStorage.setItem('pending_checkout', 'true');
      openAuthDialog();
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "pro" },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start checkout",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  }, [user, session, openAuthDialog, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show premium gate
  if (showGate) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div
          className="fixed inset-0 z-0 opacity-30"
          style={{
            backgroundImage: 'url("/lovable-uploads/IMG_0468.JPEG")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="pointer-events-none fixed inset-0 z-0 bg-background/60" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background via-transparent to-primary/20" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl w-full text-center space-y-8"
        >
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-primary/10 p-6 rounded-full border border-primary/20">
                <Lock className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Upgrade to{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                Premium
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Flow is a premium feature. Unlock unlimited access to advanced
              prompt engineering with our Premium plan.
            </p>
          </div>

          {/* Features */}
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Unlimited Flow access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Unlimited Prompt Lab generations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Early access to new features</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-4xl font-bold text-foreground">€9.90</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              {checkoutLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Crown className="w-5 h-5" />
              )}
              {checkoutLoading ? "Loading..." : "Upgrade to Premium"}
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-border text-foreground hover:bg-muted text-lg px-8 py-6 rounded-xl"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // User has premium access, show the protected content
  return <>{children}</>;
};
