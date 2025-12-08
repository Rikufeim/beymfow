import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PromptCard } from "./prompt-card";
import { PromptModal } from "./prompt-modal";
import { PROMPTS, type PromptItem } from "@/data/prompts";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  className,
}: TestimonialsSectionProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Small delay to allow modal close animation
      setTimeout(() => {
        setSelectedPrompt(null);
      }, 200);
    }
  };

  return (
    <>
      <section
        className={cn(
          "bg-background text-foreground",
          "py-12 sm:py-24 md:py-32 px-0",
          className
        )}
      >
        <div className="mx-auto flex max-w-container flex-col items-center gap-4 text-center sm:gap-16">
          <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
            <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight text-white/85">
              {title}
            </h2>
            <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl text-white/70">
              {description}
            </p>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center">
            {/* Desktop: Static card grid */}
            <div className="flex flex-wrap justify-center items-center gap-4 p-2">
              {/* Render prompts once */}
              {PROMPTS.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  subtitle={prompt.subtitle}
                  onClick={() => handleCardClick(prompt)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal for full prompt */}
      {selectedPrompt && (
        <PromptModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          title={selectedPrompt.title}
          fullPrompt={selectedPrompt.fullPrompt}
        />
      )}
    </>
  );
}

