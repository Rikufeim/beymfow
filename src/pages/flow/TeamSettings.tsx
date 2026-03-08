import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Shield, FolderOpen, Lightbulb } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const TeamSettings = () => {
  return (
    <>
      <SEOHead pathname="/flow/team-settings" overrides={{ title: "Team Settings — Beymflow", description: "Manage your team, roles, and shared workspaces in Beymflow." }} />
      <div className="min-h-screen bg-neutral-950 text-white">
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link to="/flow" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Flow
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Team Settings</h1>
        </header>

        <main className="max-w-2xl px-6 md:px-10 py-16 space-y-16">
          {/* Intro */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Collaborate with your team</h2>
            <p className="text-neutral-400 leading-relaxed">
              Beymflow is built for creative teams. Share workspaces, manage permissions, and build visual systems together — in real time.
            </p>
          </section>

          {/* Invite Members */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users size={16} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Invite team members</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Add collaborators by email. They'll receive an invitation and can start contributing immediately. You can invite people to a specific project or your entire workspace.
            </p>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-3">
              <p className="text-sm text-neutral-300 font-medium">How to invite</p>
              <ol className="text-sm text-neutral-400 space-y-2 list-decimal list-inside">
                <li>Open the workspace dropdown in the top bar</li>
                <li>Select <span className="text-white">Team Settings</span></li>
                <li>Enter the email address and choose a role</li>
                <li>They'll receive an invite link instantly</li>
              </ol>
            </div>
          </section>

          {/* Roles & Permissions */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Shield size={16} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold">Roles and permissions</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Every team member has a role that defines what they can access and modify. Assign roles based on responsibility.
            </p>
            <div className="space-y-3">
              {[
                { role: "Admin", desc: "Full access. Can manage members, billing, settings, and deploy projects.", color: "text-purple-400" },
                { role: "Editor", desc: "Can create and edit projects, workspaces, and export assets.", color: "text-cyan-400" },
                { role: "Viewer", desc: "Read-only access. Can browse projects and view exports but cannot make changes.", color: "text-neutral-400" },
              ].map(({ role, desc, color }) => (
                <div key={role} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex gap-4">
                  <span className={`text-sm font-semibold ${color} min-w-[60px]`}>{role}</span>
                  <span className="text-sm text-neutral-400">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Shared Workspaces */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FolderOpen size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold">Shared workspaces</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Workspaces are the foundation of team collaboration. Everyone in a workspace sees the same projects, color systems, and exports. Changes sync automatically.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              You can also invite collaborators to a single project without giving them access to the full workspace. Perfect for freelancers or external partners.
            </p>
          </section>

          {/* Best Practices */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lightbulb size={16} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Collaboration best practices</h3>
            </div>
            <ul className="text-sm text-neutral-400 space-y-3">
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Keep workspaces focused. One workspace per product or brand identity works best.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Use the Viewer role for stakeholders who need visibility without editing access.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Name your projects clearly — your team will thank you later.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span>Review permissions quarterly. Remove inactive members to keep your workspace clean.</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
};

export default TeamSettings;
