import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Bug, Sparkles, Layout, Heart, Send, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug report", icon: Bug, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { value: "feature", label: "Feature idea", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { value: "ux", label: "UX improvement", icon: Layout, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { value: "general", label: "General", icon: MessageSquare, color: "text-neutral-400", bg: "bg-white/[0.03]", border: "border-white/10" },
];

const GiveFeedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please fill in your name and message.");
      return;
    }
    if (name.trim().length > 100 || message.trim().length > 5000 || (email && email.length > 255)) {
      toast.error("Input too long.");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("feedback" as any).insert({
        name: name.trim(),
        email: email.trim() || null,
        feedback_type: feedbackType,
        message: message.trim(),
      } as any);

      if (error) throw error;
      setSent(true);
      toast.success("Feedback sent! Thank you.");
    } catch (err: any) {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEOHead pathname="/flow/feedback" overrides={{ title: "Give Feedback — Beymflow", description: "Share your ideas, report bugs, and help shape the future of Beymflow." }} />
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
          </section>

          {/* Feedback Form */}
          {sent ? (
            <section className="bg-white/[0.03] border border-white/5 rounded-xl p-10 text-center space-y-4">
              <CheckCircle size={32} className="text-emerald-400 mx-auto" />
              <h3 className="text-lg font-semibold">Thank you!</h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto">
                Your feedback has been received. We read everything and it directly shapes what we build next.
              </p>
              <button
                onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); setFeedbackType("general"); }}
                className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Send another →
              </button>
            </section>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-300">Type of feedback</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FEEDBACK_TYPES.map(({ value, label, icon: Icon, color, bg, border }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedbackType(value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs font-medium ${
                        feedbackType === value
                          ? `${bg} ${border} ${color}`
                          : "bg-white/[0.02] border-white/5 text-neutral-500 hover:border-white/10 hover:text-neutral-300"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="fb-name" className="text-sm font-medium text-neutral-300">Name <span className="text-rose-400">*</span></label>
                <input
                  id="fb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="fb-email" className="text-sm font-medium text-neutral-300">Email <span className="text-neutral-600">(optional)</span></label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
                <p className="text-xs text-neutral-600">So we can follow up if needed.</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="fb-message" className="text-sm font-medium text-neutral-300">Message <span className="text-rose-400">*</span></label>
                <textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, idea, or the issue you encountered..."
                  rows={5}
                  maxLength={5000}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
                />
                <p className="text-xs text-neutral-600 text-right">{message.length} / 5000</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={sending || !name.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-xl transition-colors"
              >
                {sending ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <Send size={14} />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tips */}
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
                <span>No feedback is too small. Even a typo report improves the product.</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
};

export default GiveFeedback;
