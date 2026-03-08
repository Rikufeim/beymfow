import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Lock, CreditCard, Link2, ShieldCheck } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const AccountSettings = () => {
  return (
    <>
      <SEOHead title="Account Settings — Beymflow" description="Manage your profile, security, billing, and connected services in Beymflow." />
      <div className="min-h-screen bg-neutral-950 text-white">
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link to="/flow" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Flow
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Account Settings</h1>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16 space-y-16">
          {/* Intro */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Your account</h2>
            <p className="text-neutral-400 leading-relaxed">
              Manage your personal information, security preferences, and subscription. You're always in control of your data.
            </p>
          </section>

          {/* Profile */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User size={16} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Profile information</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Update your display name, email address, and avatar. Your profile is visible to team members in shared workspaces.
            </p>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-sm text-neutral-400">
              Changes to your email require verification. We'll send a confirmation link to your new address before switching.
            </div>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Lock size={16} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold">Security</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Keep your account secure with a strong password and two-factor authentication. We recommend enabling 2FA for all accounts with team access.
            </p>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Password</strong> — Use a unique password with at least 12 characters.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Two-factor authentication</strong> — Add an extra layer of security via authenticator app.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Active sessions</strong> — Review and revoke access from devices you no longer use.</span>
              </li>
            </ul>
          </section>

          {/* Subscription */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <CreditCard size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold">Subscription and billing</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              View your current plan, update payment methods, and manage invoices. Upgrades take effect immediately — downgrades apply at the end of your billing cycle.
            </p>
            <Link
              to="/settings/billing"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Go to Billing →
            </Link>
          </section>

          {/* Connected Services */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Link2 size={16} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">Connected services</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Connect external tools to streamline your workflow. Link your GitHub account for code exports, or connect design tools for asset syncing.
            </p>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-sm text-neutral-400">
              Connected services only access the data you explicitly authorize. You can revoke access at any time.
            </div>
          </section>

          {/* Data & Privacy */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold">Data and privacy</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Your projects and data belong to you. Export everything at any time. You can request a full data export or permanently delete your account from this section.
            </p>
            <ul className="text-sm text-neutral-400 space-y-2">
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Download a full archive of your workspaces and projects</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Delete your account and all associated data permanently</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Review our privacy policy for full transparency</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
};

export default AccountSettings;
