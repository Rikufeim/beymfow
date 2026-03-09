"use client";
import { useState, useMemo } from "react";
import { saveProject } from "@/lib/workspaceStore";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  getSnapshot: () => any; // funktio, joka palauttaa tallennettava state
  onSaved?: (p: any) => void;
};

export default function PromptLabTopbar({ getSnapshot, onSaved }: Props) {
  const { loading, loggedIn, user } = useAuth();
  const [name, setName] = useState("Untitled Project");
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(0);
  const canSave = useMemo(() => loggedIn && !saving && !loading, [loggedIn, saving, loading]);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const snap = getSnapshot();
    const project = await saveProject({ name, ...snap });
    setSaving(false);
    setSavedTick(Date.now());
    onSaved?.(project);
  }

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border-b border-[#1A1A1A] bg-[#0B0B0B]">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium pr-1">Home</span>
        </a>
        <span className="mx-3 text-[#2A2A2A]">/</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#111] border border-[#222] rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#8B5CF6]"
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        {loading ? (
          <span className="opacity-60">Checking sign-in…</span>
        ) : loggedIn ? (
          <>
            <span className="opacity-70">{user?.name || user?.email || "Signed in"}</span>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-3 py-1.5 text-sm rounded-md border border-[#272727] bg-[#141414] hover:bg-[#171717] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save project"}
            </button>
            <span className="text-xs opacity-60">{saving ? "…" : savedTick ? "Saved" : ""}</span>
          </>
        ) : (
          <a href="/auth" className="opacity-80 hover:opacity-100">
            Sign in to save
          </a>
        )}
      </div>
    </div>
  );
}
