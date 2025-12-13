import Layout from "@/components/Layout";
import { Check, Plus, Minus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import ctaFooterBg from "@/assets/cta-footer-bg.png";
import featuresSectionBg from "@/assets/features-section-bg.png";

// Pricing data - 4 tiers
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    yearlyPrice: "$0",
    description: "Perfect for getting started and exploring our platform",
    sectionTitle: "Includes:",
    features: [
      "Basic prompt generation",
      "Limited daily credits",
      "Community support",
    ],
    buttonText: "Get started",
    isPopular: false,
  },
  {
    name: "Starter",
    price: "$12",
    period: "/month",
    yearlyPrice: "$9.60",
    description: "Great for small businesses and startups looking to get started with AI",
    sectionTitle: "Everything in Free, plus:",
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
    isPopular: true,
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
      "Priority support",
      "Advanced analytics",
    ],
    buttonText: "Get started",
    isPopular: false,
  },
];

// Features included in every plan
const includedFeatures = [
  { col: 1, items: [
    "AI powered app building",
    "Integrated backend and database system",
    "Responsive visual editor",
    "Analytics dashboard",
    "Multi-user editing and collaboration",
  ]},
  { col: 2, items: [
    "Cloud storage",
    "Authentication and user management",
    "Payment processing",
    "Email marketing tools",
    "Debugging and troubleshooting tools",
  ]},
];

// FAQ data
const faqItems = [
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes basic prompt generation, limited daily credits, and access to our community support. It's perfect for getting started and exploring our platform.",
  },
  {
    question: "What are integration credits?",
    answer: "Integration credits are used when you connect external services or APIs to your projects. Each integration uses a certain number of credits based on complexity.",
  },
  {
    question: "What happens if I reach my plan limits?",
    answer: "If you reach your plan limits, you can upgrade to a higher tier for more resources, or wait until your limits reset at the beginning of the next billing cycle.",
  },
];

const Premium = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth");
      return;
    }
    toast.info(`Starting subscription for ${planName} plan...`);
  };

  return (
    <Layout>
      {/* Pricing Section */}
      <div className="relative bg-black text-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-24 md:py-32">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start"
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

      {/* Features Section - Background Image */}
      <div className="relative text-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-24">
        <img 
          src={featuresSectionBg} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                Eliminate costly, complex add-ons. Every Beymflow plan includes:
              </h2>
            </div>
            
            {/* Right - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {includedFeatures.map((col, colIndex) => (
                <ul key={colIndex} className="space-y-4">
                  {col.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-lime-400 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Black Background */}
      <div className="bg-black text-white px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-24">
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
                Frequently asked questions
              </h2>
            </div>
            
            {/* Right - FAQ Accordion */}
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <div key={index} className="border-t border-neutral-700">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between py-6 text-left"
                  >
                    <span className="text-lg font-medium text-white pr-4">{item.question}</span>
                    {openFaqIndex === index ? (
                      <Minus className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pb-6"
                    >
                      <p className="text-neutral-400 leading-relaxed">{item.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
              <div className="border-t border-neutral-700" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Background Image */}
      <div className="relative px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-32">
        {/* Background Image */}
        <img 
          src={ctaFooterBg} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-center">
          {/* Card */}
          <div className="bg-neutral-900 rounded-3xl p-10 sm:p-16 text-center max-w-md w-full shadow-2xl border border-neutral-800">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8">
              So, what are we building?
            </h2>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold text-sm hover:bg-neutral-200 transition-colors"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
      className="relative h-full"
    >
      {/* Card with GlowingEffect */}
      <div className="relative h-full rounded-2xl p-[1px]">
        <GlowingEffect 
          spread={40} 
          glow={true}
          disabled={false} 
          proximity={64} 
          inactiveZone={0.01} 
          borderWidth={2} 
          className="opacity-70"
        />
        <div className="relative flex flex-col rounded-[1.05rem] p-6 sm:p-8 h-full transition-all duration-300 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]">
          {/* Popular Badge */}
          {plan.isPopular && (
            <div className="absolute top-4 left-6">
              <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                Popular
              </span>
            </div>
          )}

          {/* Price */}
          <div className={cn("mb-4", plan.isPopular && "mt-8")}>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-white">
                {displayPrice}
              </span>
              <span className="text-base text-neutral-400">
                {plan.period}
              </span>
            </div>
          </div>

          {/* Plan Name */}
          <h3 className="text-2xl font-bold mb-2 text-white">
            {plan.name}
          </h3>

          {/* Description */}
          <p className="text-sm mb-6 leading-relaxed text-neutral-400">
            {plan.description}
          </p>

          {/* CTA Button - Fixed height position */}
          <div className="mt-auto pt-4">
            <button
              onClick={() => onSubscribe(plan.name)}
              className={cn(
                "w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 mb-6",
                plan.isPopular
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              )}
            >
              {plan.buttonText}
            </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-6 bg-white/10" />

          {/* Section Title */}
          <p className="text-sm font-semibold mb-4 text-white">
            {plan.sectionTitle}
          </p>

          {/* Features List */}
          <ul className="flex-1 space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  plan.isPopular
                    ? "border-teal-400 text-teal-400"
                    : "border-neutral-500 text-neutral-400"
                )}>
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-neutral-300">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Premium;
