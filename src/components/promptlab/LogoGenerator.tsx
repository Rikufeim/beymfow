import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, X, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";

interface LogoGeneratorProps {
  toolColor: string;
}

export const LogoGenerator = ({ toolColor: _toolColor }: LogoGeneratorProps) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setResult("");
    }
  }, [input]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter what you want to generate");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const logoPrompt = `Create a professional logo for: ${input}. Style: modern, clean, vector-based logo design with transparent background.`;
      
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: logoPrompt },
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast.error("Failed to generate logo. Please try again.");
        return;
      }

      if (data?.error) {
        console.error("Edge function returned error:", data.error);
        toast.error(data.error);
        return;
      }

      if (data?.image) {
        setResult(data.image);
        toast.success("Logo generated!");
      }
    } catch (error) {
      console.error("Error generating:", error);
      toast.error("Failed to generate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult("");
    setInput("");
    toast.success("Cleared!");
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = `logo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logo downloaded!");
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 space-y-6">
      {!result && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the logo you want to create..."
              className="w-full min-h-[120px] sm:min-h-[150px] bg-black/60 border border-white/15 rounded-xl p-4 text-white placeholder:text-white/50 resize-none focus:outline-none focus:border-white/30 transition-colors"
              maxLength={1000}
            />
          </div>
          <GlassButton
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            contentClassName="flex items-center gap-2 w-full justify-center"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Logo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Logo
              </>
            )}
          </GlassButton>
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
            <img
              src={result}
              alt="Generated Logo"
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-2">
            <GlassButton
              size="sm"
              onClick={clearResult}
              contentClassName="flex items-center gap-2 w-full justify-center"
              className="w-full"
            >
              <X className="w-4 h-4" />
              Clear
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={handleDownload}
              contentClassName="flex items-center gap-2 w-full justify-center"
              className="w-full"
            >
              <Download className="w-4 h-4" />
              Download
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
};
