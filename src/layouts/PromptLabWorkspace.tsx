"use client";
import { useEffect, useMemo, type ReactNode } from "react";
import PromptLabTopbar from "@/components/PromptLabTopbar";
import { PromptLabProvider, usePromptLab } from "@/contexts/PromptLabContext";

type WorkspaceProps = {
  Left: ReactNode;
  Center: ReactNode;
  Right: ReactNode;
};

function WorkspaceShell({ Left, Center, Right }: WorkspaceProps) {
  const { assistantMessages, optimizerMessages } = usePromptLab();

  useEffect(() => {
    (window as any).__assistantMessages = assistantMessages;
  }, [assistantMessages]);

  useEffect(() => {
    (window as any).__optimizerMessages = optimizerMessages;
  }, [optimizerMessages]);

  const baseSnapshot = useMemo(
    () => ({
      assistantMessages,
      optimizerMessages,
    }),
    [assistantMessages, optimizerMessages]
  );

  function getSnapshot() {
    return {
      ...baseSnapshot,
      generatorState: (window as any)?.__generatorState ?? {},
    };
  }

  return (
    <div className="prompt-lab-workspace bg-[#0A0A0A] text-white min-h-screen flex flex-col">
      <PromptLabTopbar getSnapshot={getSnapshot} />
      <main className="flex flex-1 overflow-auto">
        <section className="w-[32%] min-w-[320px] border-r border-[#1A1A1A] overflow-y-auto">{Left}</section>
        <section className="flex-1 border-r border-[#1A1A1A] overflow-y-auto">{Center}</section>
        <section className="w-[32%] min-w-[320px] overflow-y-auto">{Right}</section>
      </main>
    </div>
  );
}

export default function PromptLabWorkspace(props: WorkspaceProps) {
  return (
    <PromptLabProvider>
      <WorkspaceShell {...props} />
    </PromptLabProvider>
  );
}
