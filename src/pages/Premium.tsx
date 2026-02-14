import { CheckCircle, Check, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useState } from "react";
import BackgroundShader from "@/components/ui/background-shader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const everyPlanFeatures = [
  "Secure user authentication",
  "Project saving & auto-save",
  "Modern background library",
  "Access to core Prompt Generator",
  "Continuous feature updates",
];

const faqItems = [
  {
    question: "What's included in the free plan?",
    answer: "The Free plan gives you access to the core Prompt Generator features so you can start creating immediately.\n\nYou get:\n• Basic prompt generation\n• Limited daily prompts\n• Access to selected templates\n• Standard background styles\n• Community support\n\nPerfect for testing the platform and exploring creative possibilities before upgrading.",
  },
  {
    question: "What are integration credits?",
    answer: "Integration credits are usage units that allow you to connect and use advanced tools inside the Prompt Generator.\n\nThey are used when:\n• Accessing advanced model options\n• Using premium prompt tools\n• Generating high-complexity outputs\n\nPro users receive full access without limitations, while Free users have limited usage.",
  },
  {
    question: "What happens if I reach my plan limits?",
    answer: "If you reach your limits on the Free plan:\n• Prompt generation will pause until the daily limit resets\n• Some advanced tools will be temporarily unavailable\n\nYou can upgrade to the Pro plan anytime to unlock unlimited access and remove restrictions instantly.",
  },
];

const Premium = () => {
  const navigate = useNavigate();
  const { user, session, usageInfo } = useAuth();
  const { toast } = useToast();
  const { openAuthDialog } = useAuthDialog();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPro = usageInfo?.subscriptionTier === "premium";

  const handleUpgrade = async () => {
    if (!user || !session) {
      openAuthDialog(() => {
        // After login, user can click upgrade again
      });
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "pro" },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to open subscription portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <BackgroundShader variant="black">
        <div className="relative min-h-screen pt-20 pb-24 px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20 md:space-y-24">
          {/* Pricing Section */}
          <section className="pt-12 lg:pt-20">
            <div className="grid lg:grid-cols-5 gap-16 lg:gap-20 items-center">
                {/* Left: Headline & Subheadline */}
                <div className="lg:col-span-2 space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                    Pricing
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-md">
                    Upgrade when you need full creative flow
                  </p>
                </div>

                {/* Right: Two black pricing cards */}
                <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6 sm:gap-8">
                  {/* Free Plan Card */}
                  <div className="relative flex flex-col rounded-2xl border border-white/10 bg-black/90 backdrop-blur-sm p-5 sm:p-6">
                    {usageInfo?.subscriptionTier === "free" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/20">
                          Your Plan
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-white mb-1">Free Plan</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">€0</span>
                      <span className="text-white/60 text-sm"> / month</span>
                    </div>
                    <ul className="space-y-2 flex-1 mb-5">
                      {[
                        "Basic prompt generation",
                        "Limited daily prompts",
                        "Access to selected templates",
                        "Standard background styles",
                        "Community support"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                          <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        if (user) {
                          navigate("/flow");
                        } else {
                          sessionStorage.setItem('auth_redirect_after', '/flow');
                          openAuthDialog(() => navigate("/flow"));
                        }
                      }}
                      className="w-full rounded-lg px-4 py-3 text-sm border border-white/20 bg-white/10 text-white font-medium transition-all hover:bg-white/20 hover:border-white/30"
                    >
                      Start Free
                    </button>
                  </div>

                  {/* Pro Plan Card (Most Popular) */}
                  <div className={`relative flex flex-col rounded-2xl border ${isPro ? 'border-cyan-400/40' : 'border-white/10'} bg-black/90 backdrop-blur-sm p-5 sm:p-6`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${isPro ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'}`}>
                        {isPro ? "✓ Your Plan" : "Most Popular"}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Pro Plan</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">€9.99</span>
                      <span className="text-white/60 text-sm"> / month</span>
                    </div>
                    <ul className="space-y-2 flex-1 mb-5">
                      {[
                        "Unlimited prompt generation",
                        "Full access to all Prompt Generator tools",
                        "Complete access to Color Codes section",
                        "Advanced model options",
                        "All background styles",
                        "Premium templates",
                        "Faster processing",
                        "Priority support"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                          <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isPro ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="w-full rounded-lg px-4 py-3 text-sm border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-medium transition-all hover:bg-cyan-500/20 flex items-center justify-center gap-2"
                      >
                        {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Manage Subscription
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgrade}
                        disabled={checkoutLoading}
                        className="w-full rounded-lg px-4 py-3 text-sm bg-white text-black font-medium border border-white transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                      >
                        {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>
              </div>
          </section>

          {/* Every plan includes */}
          <section className="text-white">
              <div className="flex flex-col lg:flex-row lg:justify-start">
                <div className="lg:w-1/2 flex flex-col items-start text-left space-y-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                    Every plan includes
                  </h2>
                  <ul className="space-y-3">
                    {everyPlanFeatures.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 justify-start">
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-white">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white mb-10">
              Frequently asked questions
            </h2>
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <div key={index} className="border-t border-white/10">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between py-6 text-left"
                  >
                    <span className="text-lg font-medium text-white pr-4">{item.question}</span>
                    {openFaqIndex === index ? (
                      <Minus className="w-5 h-5 text-white/40 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/40 flex-shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <p className="pb-6 text-white/70 leading-relaxed whitespace-pre-line">{item.answer}</p>
                  )}
                </div>
              ))}
              <div className="border-t border-white/10" />
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex items-center justify-start">
            <div className="flex flex-col items-start">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                So, what are we building?
              </h2>
              <Link
                to={user ? "/flow" : "#"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    openAuthDialog(() => navigate("/flow"));
                  }
                }}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
          </div>
        </div>
      </BackgroundShader>
  );
};

export default Premium;
