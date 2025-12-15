import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ImagePromptChat from "@/components/ImagePromptChat";
import CreditsDisplay from "@/components/CreditsDisplay";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Download, Sparkles, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGuestUsage } from "@/hooks/useGuestUsage";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [beymflowStyle, setBeymflowStyle] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { session, usageInfo, refreshUsage } = useAuth();
  const navigate = useNavigate();
  const guestUsage = useGuestUsage('guest_image_usage', 2);

  const IMAGE_GENERATION_COST = 2;

  useEffect(() => {
    if (generatedImage && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }, 100);
    }
  }, [generatedImage]);

  useEffect(() => {
    if (showAIChat && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }, 100);
    }
  }, [showAIChat]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check guest usage if not logged in
    if (!session) {
      if (!guestUsage.canUse) {
        toast.error(`You've used all ${guestUsage.maxUsage} free generations. Please sign in to continue.`);
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
    }

    // Check credits for logged in users
    if (session && usageInfo && !usageInfo.hasActiveSubscription) {
      if (usageInfo.creditsRemaining < IMAGE_GENERATION_COST) {
        toast.error(`Not enough credits. Need ${IMAGE_GENERATION_COST}, have ${usageInfo.creditsRemaining}`);
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setShowAIChat(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim(), cost: IMAGE_GENERATION_COST, beymflowStyle },
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

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success("Image generated successfully!");
        
        // Increment guest usage if not logged in
        if (!session) {
          guestUsage.incrementUsage();
          const remaining = guestUsage.maxUsage - (guestUsage.usageCount + 1);
          if (remaining > 0) {
            toast.info(`${remaining} free generation${remaining === 1 ? '' : 's'} remaining`);
          }
        } else {
          await refreshUsage();
        }
      } else {
        throw new Error("No image in response");
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      const errorMsg = error?.message || "Failed to generate image";
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <>
      <CreditsDisplay />
      <div className="min-h-screen bg-black text-white flex flex-col items-center">
        <Header />
        
        <div className="w-full flex flex-col items-center pt-[160px] pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <div className="text-left pl-8 md:pl-16 lg:pl-24 mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight chrome-text mb-8">
                <div>
                  {["Beymflow", "AI"].map((word, index) => (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-4"
                      style={{ willChange: "transform" }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div>
                  {["Image", "Generator"].map((word, index) => (
                    <span
                      key={index}
                      className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-4"
                      style={{ willChange: "transform" }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                Absolute Precision — Every detail matched exactly: objects, colors, lighting, textures, and composition
              </p>
            </div>

            <div className={`bg-black backdrop-blur-sm rounded-2xl p-8 border-2 mb-8 transition-all duration-500 relative ${
              isGenerating 
                ? 'border-gray-400' 
                : 'border-gray-600/50 shadow-[0_0_20px_rgba(107,114,128,0.3)]'
            }`}>
              {isGenerating && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none">
                  <div className="absolute inset-0 rounded-2xl animate-spin-slow bg-gradient-to-r from-transparent via-gray-400/50 to-transparent" />
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder=""
                    className="min-h-[120px] bg-black/40 border-white/20 text-white placeholder:text-gray-500 resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowAIChat(!showAIChat)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-12 text-base font-medium"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {showAIChat ? "Hide" : "AI Assistant"}
                  </Button>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-white text-black hover:bg-gray-200 transition-all duration-300 h-12 text-base font-medium"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showAIChat && (
                <motion.div
                  ref={chatRef}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-8"
                >
                  <ImagePromptChat 
                    currentPrompt={prompt}
                    onPromptUpdate={(updatedPrompt) => setPrompt(updatedPrompt)}
                    onGenerateWithPrompt={(newPrompt) => {
                      setPrompt(newPrompt);
                      handleGenerate();
                    }}
                    onClose={() => setShowAIChat(false)}
                  />
                </motion.div>
              )}

              {generatedImage && (
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
                      src={generatedImage}
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
                  {generatedImage && (
                    <img
                      src={generatedImage}
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
              className="mt-24 space-y-4 max-w-2xl"
            >
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-base mb-3">🎨 Why Use Our Image Generator?</h4>
                <p className="text-white/70 text-sm leading-relaxed">Create stunning, cinematic, or conceptual AI images that capture emotion, story, and vision. Built for creators, designers, and thinkers who want to bring imagination to life through visuals that feel real.</p>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-base mb-3">⚡ How Does It Work?</h4>
                <p className="text-white/70 text-sm leading-relaxed">Just type your idea — from "a futuristic skyline at dusk" to "a surreal concept art portrait" — and our generator transforms it into a professional, stylized prompt optimized for Midjourney, DALL·E, and other AI image tools. No learning curve. No limits. Just creation.</p>
              </div>
            </motion.div>
          </motion.div>

          <div className="mt-32">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageGenerator;
