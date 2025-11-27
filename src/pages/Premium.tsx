import Layout from "@/components/Layout";
import { Crown, Sparkles, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Pricing data updated to match requirements
const pricingPlans = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    description: "Perfect for beginners",
    features: [
      "Unlimited prompt creation in Prompt Generator",
      "Unlimited prompt creation in Prompt Lab",
      "Early access to new prompt features",
    ],
    buttonText: "Current Plan",
    buttonStyle: "border border-white/20 text-white hover:border-white/40 hover:bg-white/[0.07]",
    cardStyle: "border-white/10 hover:border-white/25 hover:shadow-[0_35px_65px_-28px_rgba(59,130,246,0.35)]",
    accent: {
      glow: "rgba(56, 189, 248, 0.28)",
      beam: "linear-gradient(120deg, rgba(14,165,233,0.3), rgba(59,130,246,0.12))",
    },
  },
  {
    name: "Premium",
    price: "€9.90",
    period: "/month",
    description: "For professionals who build at scale",
    features: [
      "Unlimited prompt creation in Prompt Generator",
      "Unlimited prompt creation in Prompt Lab",
      "Unlimited prompt creation in Flow Engine",
      "Early access to new prompt features",
    ],
    buttonText: "Upgrade to Premium",
    buttonStyle: "bg-[#facc15] text-black border border-transparent hover:bg-[#fbbf24]",
    cardStyle:
      "border-white/15 hover:border-[#facc15]/60 hover:shadow-[0_45px_85px_-30px_rgba(250,204,21,0.55)] relative transform md:-translate-y-4 z-10",
    accent: {
      glow: "rgba(250, 204, 21, 0.28)",
      beam: "linear-gradient(120deg, rgba(250,204,21,0.28), rgba(253,224,71,0.12))",
    },
    isPremium: true,
  },
];

const Premium = () => {
  const { user, usageInfo } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription process");
    }
  };

  return (
    <Layout>
      {/* Main Container with Better Spacing and Relative positioning */}
      <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-24 md:py-32">
        {/* --- BACKGROUND LAYERS START --- */}
        {/* Kiinteä taustakuva */}
        <div
          className="fixed inset-0 z-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://raw.githubusercontent.com/multiply-dev/multiply-dark-web-forge/main/public/lovable-uploads/IMG_0468.JPEG")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Tummennus taustan päälle */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-black/60" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black via-transparent to-purple-900/20" />
        {/* --- BACKGROUND LAYERS END --- */}

        {/* Content Wrapper (z-10 to sit on top of background) */}
        <div className="relative z-10 max-w-6xl w-full text-center">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-24 sm:mb-32 md:mb-40"
          >
            {/* Updated Headline Style */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white mb-6 drop-shadow-2xl">
              Upgrade Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent pb-2">
                AI Flow
              </span>
            </h1>

            {/* New Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-400 font-medium">Choose the perfect flow for your needs</p>
          </motion.div>

          {/* Pricing Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 items-center max-w-4xl mx-auto"
          >
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                index={index}
                onSubscribe={handleSubscribe}
                currentTier={usageInfo?.subscriptionTier || "free"}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

// Separate component for pricing cards for better organization
const PricingCard = ({
  plan,
  index,
  onSubscribe,
  currentTier,
}: {
  plan: (typeof pricingPlans)[0];
  index: number;
  onSubscribe: (priceId: string, planName: string) => void;
  currentTier: "free" | "basic" | "premium";
}) => {
  const priceIds = {
    Free: null,
    Premium: "price_1SMnpEKXIuUdBsrAvAEwJWXw",
  };

  const isCurrentPlan =
    (plan.name === "Free" && currentTier === "free") || (plan.name === "Premium" && currentTier === "premium");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className={`group relative overflow-hidden rounded-3xl border bg-[#0b0d11] p-6 sm:p-8 flex flex-col transition-all duration-300 ${plan.cardStyle}`}
    >
      {/* Background Glow Effects */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: plan.accent.glow }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 opacity-40 blur-3xl transition-all duration-300 group-hover:opacity-70"
        style={{ background: plan.accent.beam }}
      />

      {/* Most Popular Tag */}
      {plan.isPremium && (
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div className="bg-[#facc15] text-black text-xs font-bold px-3 py-1 rounded-b-lg shadow-[0_0_10px_rgba(250,204,21,0.4)] flex items-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="mb-5 mt-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-3 mb-5">
          {plan.name}
          {plan.isPremium && <Crown className="w-5 h-5 text-[#facc15]" />}
        </h2>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-2 mb-3">
          <span className="text-4xl sm:text-5xl font-bold text-white">
            {plan.price}
          </span>
          <span className="text-base text-neutral-400">{plan.period}</span>
        </div>

        <p className="text-base text-neutral-400 mb-3">{plan.description}</p>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

      {/* Features List */}
      <ul className="flex-1 space-y-3 text-base text-neutral-300 text-left mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-xs border-white/20 bg-white/10 text-white"
            >
              ✓
            </span>
            <span
              className={`leading-relaxed ${
                plan.isPremium
                  ? "text-neutral-100 font-medium"
                  : "text-neutral-300"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => {
          if (plan.name !== "Free" && priceIds[plan.name as keyof typeof priceIds]) {
            onSubscribe(priceIds[plan.name as keyof typeof priceIds]!, plan.name);
          }
        }}
        disabled={isCurrentPlan || plan.name === "Free"}
        className={`w-full text-center text-base font-semibold rounded-xl px-6 py-3 transition-colors ${
          isCurrentPlan
            ? "border border-green-500/50 bg-green-500/15 text-green-300 cursor-not-allowed"
            : plan.buttonStyle
        } disabled:cursor-not-allowed`}
      >
        {isCurrentPlan ? "Current Plan" : plan.buttonText}
      </button>
    </motion.div>
  );
};

export default Premium;
