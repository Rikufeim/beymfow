import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const CreditsDisplay = () => {
  const { usageInfo, session, refreshUsage } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show for authenticated users
  if (!usageInfo || !session) return null;

  const handleSubscribe = async () => {
    if (!session) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Opening Stripe Checkout...");
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error("Failed to start checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Opening Stripe Portal...");
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error("Failed to open portal");
    } finally {
      setIsPortalLoading(false);
    }
  };

  const isUnlimited = usageInfo.creditsRemaining === -1;
  const isPremium = usageInfo.hasActiveSubscription;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 md:top-24 right-2 md:right-4 z-50"
    >
      <Card className="bg-black backdrop-blur-sm border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
        {isMinimized ? (
          <div className="p-2 flex items-center gap-2">
            {isPremium ? (
              <Crown className="h-4 w-4 text-yellow-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-white" />
            )}
            <Button
              onClick={() => setIsMinimized(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <ChevronDown className="h-3 w-3 text-white" />
            </Button>
          </div>
        ) : (
          <div className="p-2 md:p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 shrink-0" />
                ) : (
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white shrink-0" />
                )}
                <div className="text-xs md:text-sm font-semibold text-white">
                  {isPremium ? "Premium" : `${usageInfo.creditsRemaining} credits`}
                </div>
              </div>
              <Button
                onClick={() => setIsMinimized(true)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-white/10"
              >
                <ChevronUp className="h-3 w-3 text-white" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {isPremium ? (
                <>
                  <div className="text-[10px] md:text-xs text-gray-300 flex-1">
                    Unlimited
                  </div>
                  <Button
                    onClick={handleManageSubscription}
                    disabled={isPortalLoading}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-7 px-2 text-xs shrink-0"
                  >
                    {isPortalLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Manage"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-[10px] md:text-xs text-gray-400 flex-1">
                    {usageInfo.creditsUsed} / 100 used
                  </div>
                  {usageInfo.creditsRemaining < 20 && (
                    <Button
                      onClick={handleSubscribe}
                      disabled={isCheckingOut}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white h-7 px-2 text-xs shrink-0"
                    >
                      {isCheckingOut ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        "Upgrade"
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CreditsDisplay;
