import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, X, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImagePromptGeneratorProps {
  toolColor: string;
}

export const ImagePromptGenerator = ({ toolColor: _toolColor }: ImagePromptGeneratorProps) => {
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
      console.log("Calling generate-image with prompt:", input);
      
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: input },
      });

      console.log("Response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        toast.error(`Failed to generate image: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data?.error) {
        console.error("Edge function returned error:", data.error);
        toast.error(data.error);
        return;
      }

      if (data?.image) {
        console.log("Image received successfully");
        setResult(data.image);
        toast.success("Image generated!");
      } else {
        console.error("No image in response:", data);
        toast.error("No image received from server");
      }
    } catch (error) {
      console.error("Error generating:", error);
      toast.error(`Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 space-y-6">
      {!result && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the image you want to create..."
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
                Generating Image...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Image
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
              alt="Generated"
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
