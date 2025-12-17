import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import CreditsDisplay from "@/components/CreditsDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Download, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGuestUsage } from "@/hooks/useGuestUsage";

const VideoPrompts = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { session, usageInfo, refreshUsage } = useAuth();
  const navigate = useNavigate();
  const guestUsage = useGuestUsage('guest_animation_usage', 1);

  const ANIMATION_GENERATION_COST = 5;

  useEffect(() => {
    if (generatedVideo && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }, 100);
    }
  }, [generatedVideo]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check guest usage if not logged in
    if (!session) {
      if (!guestUsage.canUse) {
        toast.error(`You've used your free animation generation. Please sign in to continue.`);
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
    }

    // Check credits for logged in users
    if (session && usageInfo && !usageInfo.hasActiveSubscription) {
      if (usageInfo.creditsRemaining < ANIMATION_GENERATION_COST) {
        toast.error(`Not enough credits. Need ${ANIMATION_GENERATION_COST}, have ${usageInfo.creditsRemaining}`);
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { prompt: prompt.trim(), cost: ANIMATION_GENERATION_COST },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      // Check for error in the response data
      if (data?.error) {
        if (data.requiresSubscription) {
          toast.error(data.error);
          toast.info("Subscribe to get unlimited generations");
          setTimeout(() => navigate('/subscribe'), 2000);
        } else {
          toast.error(data.error);
        }
        return;
      }

      if (data?.video) {
        setGeneratedVideo(data.video);
        toast.success("Animation generated successfully!");
        
        // Increment guest usage if not logged in
        if (!session) {
          guestUsage.incrementUsage();
          toast.info("That was your free animation generation. Sign in for more!");
        } else {
          await refreshUsage();
        }
      } else {
        throw new Error("No animation in response");
      }
    } catch (error: any) {
      console.error('Error generating animation:', error);
      const errorMsg = error?.message || "Failed to generate animation";
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <>
      <CreditsDisplay />
      <Layout>
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
          <div className="w-full flex flex-col items-center pt-[80px] pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <div className="text-left pl-4 sm:pl-8 md:pl-16 lg:pl-24 mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight chrome-text mb-4 sm:mb-8">
                <div>
                  {["Multiply", "AI"].map((word, index) => (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-2 sm:mr-4"
                      style={{ willChange: "transform" }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div>
                  {["Animation", "Generator"].map((word, index) => (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-2 sm:mr-4"
                      style={{ willChange: "transform" }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6">
                Create living images with motion, atmosphere, and cinematic depth
              </p>
            </div>

            <div className={`bg-black backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 border-2 mb-8 transition-all duration-500 relative ${
              isGenerating 
                ? 'border-gray-400' 
                : 'border-gray-600/50 shadow-[0_0_20px_rgba(107,114,128,0.3)]'
            }`}>
              {isGenerating && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl animate-spin-slow bg-gradient-to-r from-transparent via-gray-400/50 to-transparent" />
                </div>
              )}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the animated scene you want to create..."
                    className="min-h-[100px] sm:min-h-[120px] bg-black/40 border-white/20 text-white placeholder:text-gray-500 resize-none text-sm sm:text-base"
                    disabled={isGenerating}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Generate Animation
                    </>
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {generatedVideo && (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-4"
                >
                  <div 
                    className="relative rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-600/50 shadow-[0_0_20px_rgba(107,114,128,0.3)] cursor-pointer hover:border-gray-400/70 transition-all duration-300"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <img
                      src={generatedVideo}
                      alt="Generated"
                      className="w-full h-auto max-w-full max-h-[70vh] object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleDownload}
                      className="bg-black text-white border-2 border-gray-600/50 hover:bg-gray-600/20 transition-all duration-300"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              )}

              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogContent className="max-w-full w-screen h-screen p-0 bg-black border-none flex items-center justify-center">
                  <Button
                    onClick={() => setIsFullscreen(false)}
                    className="absolute top-4 right-4 z-50 bg-black/80 text-white border-2 border-gray-600/50 hover:bg-gray-600/20"
                    size="icon"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  {generatedVideo && (
                    <img
                      src={generatedVideo}
                      alt="Generated fullscreen"
                      className="max-w-full max-h-full object-contain"
                      onClick={() => setIsFullscreen(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </AnimatePresence>

            {/* Info Bubbles - After Generator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 sm:mt-24 space-y-3 sm:space-y-4 max-w-2xl"
            >
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3">🎬 Why Use Our Animation Generator?</h4>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">Create living images that pulse with motion and depth. Transform static concepts into dynamic visuals with cinematic movement, atmospheric flow, and emotional energy — perfect for storytelling, branding, and creative projects.</p>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-sm sm:text-base mb-2 sm:mb-3">⚡ How Does It Work?</h4>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">Describe your scene with motion cues, camera direction, and mood. The generator creates animated visuals with natural flow, depth transitions, and living atmosphere — turning ideas into images that move, breathe, and captivate.</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
      </Layout>
    </>
  );
};

export default VideoPrompts;
