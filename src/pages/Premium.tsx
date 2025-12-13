import Layout from "@/components/Layout";
import { Crown, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Pricing data - 3 tiers as shown in reference
const pricingPlans = [
  {
    name: "Starter",
    price: "$12",
    period: "/month",
    yearlyPrice: "$9.60",
    description: "Great for small businesses and startups looking to get started with AI",
    sectionTitle: "Free includes:",
    features: [
      "Unlimited Cards",
      "Custom background & stickers",
      "2-factor authentication",
    ],
    buttonText: "Get started",
    isPopular: false,
  },
  {
    name: "Business",
    price: "$48",
    period: "/month",
    yearlyPrice: "$38.40",
    description: "Best value for growing businesses that need more advanced features",
    sectionTitle: "Everything in Starter, plus:",
    features: [
      "Advanced checklists",
      "Custom fields",
      "Serverless functions",
    ],
    buttonText: "Get started",
    isPopular: false,
  },
  {
    name: "Enterprise",
    price: "$96",
    period: "/month",
    yearlyPrice: "$76.80",
    description: "Advanced plan with enhanced security and unlimited access for large teams",
    sectionTitle: "Everything in Business, plus:",
    features: [
      "Multi-board management",
      "Multi-board guest",
      "Attachment permissions",
    ],
    buttonText: "Get started",
    isPopular: true,
  },
];

const Premium = () => {
  const { user, usageInfo } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth");
      return;
    }
    
    // Placeholder for actual Stripe integration
    toast.info(`Starting subscription for ${planName} plan...`);
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-black text-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl w-full mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Plans & Pricing
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-lg text-neutral-400">
                Trusted by millions, We help teams all around the world, Explore which option is right for you.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center gap-1 bg-neutral-900 rounded-full p-1 w-fit">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    billingPeriod === "monthly"
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    billingPeriod === "yearly"
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  Yearly
                  <span className="text-xs text-emerald-400 font-semibold">Save 20%</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                index={index}
                billingPeriod={billingPeriod}
                onSubscribe={handleSubscribe}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

// Pricing Card Component
const PricingCard = ({
  plan,
  index,
  billingPeriod,
  onSubscribe,
}: {
  plan: (typeof pricingPlans)[0];
  index: number;
  billingPeriod: "monthly" | "yearly";
  onSubscribe: (planName: string) => void;
}) => {
  const displayPrice = billingPeriod === "yearly" ? plan.yearlyPrice : plan.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className={cn(
        "relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300",
        plan.isPopular
          ? "bg-neutral-900 border border-neutral-700 shadow-2xl"
          : "bg-neutral-100 text-black"
      )}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute top-4 left-6">
          <span className="bg-neutral-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}

      {/* Price */}
      <div className={cn("mb-4", plan.isPopular && "mt-8")}>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-4xl sm:text-5xl font-bold",
            plan.isPopular ? "text-white" : "text-black"
          )}>
            {displayPrice}
          </span>
          <span className={cn(
            "text-base",
            plan.isPopular ? "text-neutral-400" : "text-neutral-500"
          )}>
            {plan.period}
          </span>
        </div>
      </div>

      {/* Plan Name */}
      <h3 className={cn(
        "text-2xl font-bold mb-2",
        plan.isPopular ? "text-white" : "text-black"
      )}>
        {plan.name}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-sm mb-6 leading-relaxed",
        plan.isPopular ? "text-neutral-400" : "text-neutral-600"
      )}>
        {plan.description}
      </p>

      {/* Divider */}
      <div className={cn(
        "h-px w-full mb-6",
        plan.isPopular ? "bg-neutral-700" : "bg-neutral-300"
      )} />

      {/* Section Title */}
      <p className={cn(
        "text-sm font-semibold mb-4",
        plan.isPopular ? "text-white" : "text-black"
      )}>
        {plan.sectionTitle}
      </p>

      {/* Features List */}
      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
              plan.isPopular
                ? "border-teal-400 text-teal-400"
                : "border-neutral-400 text-neutral-600"
            )}>
              <Check className="w-3 h-3" />
            </div>
            <span className={cn(
              "text-sm",
              plan.isPopular ? "text-neutral-300" : "text-neutral-700"
            )}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => onSubscribe(plan.name)}
        className={cn(
          "w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300",
          plan.isPopular
            ? "bg-neutral-100 text-black hover:bg-white"
            : "bg-neutral-800 text-white hover:bg-neutral-900"
        )}
      >
        {plan.buttonText}
      </button>
    </motion.div>
  );
};

export default Premium;
