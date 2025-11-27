import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumGateProps {
  children: React.ReactNode;
}

export const PremiumGate = ({ children }: PremiumGateProps) => {
  const { user, usageInfo, loading } = useAuth();
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Not logged in -> redirect to auth
    if (!user) {
      navigate("/auth?redirect=/flow-engine");
      return;
    }

    // Check if user has premium access
    const isPremium = usageInfo?.subscriptionTier === "premium";
    
    // Show gate if not premium
    setShowGate(!isPremium);
  }, [user, usageInfo, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Show premium gate
  if (showGate) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
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
        <div className="pointer-events-none fixed inset-0 z-0 bg-black/60" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black via-transparent to-purple-900/20" />

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
              <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
              <div className="relative bg-yellow-500/10 p-6 rounded-full border border-yellow-500/20">
                <Lock className="w-16 h-16 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Upgrade to{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Premium
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Flow Engine is a premium feature. Unlock unlimited access to advanced
              prompt engineering with our Premium plan.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-gray-200">Unlimited Flow Engine access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-gray-200">Unlimited Prompt Lab generations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-gray-200">Early access to new features</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-4xl font-bold text-white">€9.90</span>
                <span className="text-gray-400">/month</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/premium")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
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
