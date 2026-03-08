import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bug, Sparkles, Layout, Heart } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const GiveFeedback = () => {
  return (
    <>
      <SEOHead title="Give Feedback — Beymflow" description="Share your ideas, report bugs, and help shape the future of Beymflow." />
      <div className="min-h-screen bg-neutral-950 text-white">
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link to="/flow" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Flow
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Give Feedback</h1>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16 space-y-16">
          {/* Welcome */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-3">We're building this with you</h2>
            <p className="text-neutral-400 leading-relaxed">
              Beymflow gets better with every piece of feedback. Whether it's a bug you noticed, a feature you need, or an idea that would make your workflow smoother — we want to hear it.
            </p>
            <p className="text-neutral-400 leading-relaxed mt-3">
              Your input directly shapes what we build next. Every suggestion is read by the team.
            </p>
          </section>

          {/* Types of Feedback */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">What you can share</h3>
            <div className="space-y-3">
              {[
                {
                  icon: Bug,
                  color: "text-rose-400",
                  bg: "bg-rose-500/10",
                  title: "Bug reports",
                  desc: "Something broken or behaving unexpectedly? Let us know what happened, what you expected, and how to reproduce it."
                },
                {
                  icon: Sparkles,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  title: "Feature ideas",
                  desc: "Have an idea for a new tool, export format, or workspace feature? We're always exploring what to build next."
                },
                {
                  icon: Layout,
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                  title: "UX improvements",
                  desc: "Noticed something that could be more intuitive? Small interface refinements often make the biggest difference."
                },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 flex gap-4 items-start">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{title}</p>
                    <p className="text-sm text-neutral-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Encouragement */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Heart size={16} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Good feedback goes a long way</h3>
            </div>
            <ul className="text-sm text-neutral-400 space-y-3">
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Be specific. "The gradient export doesn't include opacity" is more helpful than "export is broken."</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Include context. What were you trying to do? What happened instead?</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Screenshots help. A visual reference makes it easier for us to understand and act quickly.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>No feedback is too small. Even a typo report improves the product.</span>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center space-y-4">
            <MessageSquare size={24} className="text-purple-400 mx-auto" />
            <p className="text-neutral-300 text-sm leading-relaxed max-w-md mx-auto">
              You can send feedback anytime using the workspace menu or by reaching out to us directly. We read everything and respond when we can.
            </p>
            <p className="text-xs text-neutral-600">Thank you for helping us make Beymflow better.</p>
          </section>
        </main>
      </div>
    </>
  );
};

export default GiveFeedback;
