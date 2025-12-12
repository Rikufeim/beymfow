import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fullPrompt: string;
}

export function PromptModal({
  open,
  onOpenChange,
  title,
  fullPrompt,
}: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-white/85">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Scrollable prompt area */}
          <div className="relative">
            <pre
              className={cn(
                "w-full p-4 rounded-lg",
                "bg-black/50 border border-white/10",
                "text-sm sm:text-base text-white/80",
                "font-mono whitespace-pre-wrap break-words",
                "max-h-[50vh] overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              )}
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
              }}
            >
              {fullPrompt}
            </pre>
          </div>

          {/* Copy button */}
          <Button
            onClick={handleCopy}
            className={cn(
              "w-full sm:w-auto",
              "bg-white/10 hover:bg-white/20",
              "text-white border border-white/20",
              "transition-all duration-200"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Prompt copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy prompt
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}






