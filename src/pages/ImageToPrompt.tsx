import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import CreditsDisplay from "@/components/CreditsDisplay";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGuestUsage } from "@/hooks/useGuestUsage";

const ImageToPrompt = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { session, usageInfo, refreshUsage } = useAuth();
  const navigate = useNavigate();
  const guestUsage = useGuestUsage('guest_image_to_prompt_usage', 1);

  const IMAGE_ANALYSIS_COST = 2;

  useEffect(() => {
    if (generatedPrompt && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'start' 
        });
      }, 100);
    }
  }, [generatedPrompt]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedPrompt("");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !imagePreview) {
      toast.error("Please select an image first");
      return;
    }

    // Check guest usage if not logged in
    if (!session) {
      if (!guestUsage.canUse) {
        toast.error(`You've used all ${guestUsage.maxUsage} free analysis. Please sign in to continue.`);
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }
    }

    // Check credits for logged in users
    if (session && usageInfo && !usageInfo.hasActiveSubscription) {
      if (usageInfo.creditsRemaining < IMAGE_ANALYSIS_COST) {
        toast.error(`Not enough credits. Need ${IMAGE_ANALYSIS_COST}, have ${usageInfo.creditsRemaining}`);
        return;
      }
    }

    setIsAnalyzing(true);
    setGeneratedPrompt("");

    try {
      const { data, error } = await supabase.functions.invoke('image-to-prompt', {
        body: { image: imagePreview, cost: IMAGE_ANALYSIS_COST },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (error) throw error;

      if (data?.prompt) {
        setGeneratedPrompt(data.prompt);
        toast.success("Prompt generated successfully!");
        
        // Increment guest usage if not logged in
        if (!session) {
          guestUsage.incrementUsage();
          const remaining = guestUsage.maxUsage - (guestUsage.usageCount + 1);
          if (remaining > 0) {
            toast.info(`${remaining} free analysis remaining`);
          }
        } else {
          await refreshUsage();
        }
      } else {
        throw new Error("No prompt in response");
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
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
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Image to Prompt
              </h1>
              <p className="text-lg text-gray-400">
                Convert your images into detailed AI prompts
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    Upload Image
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition-colors duration-300 bg-black/40"
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium">Click to upload</p>
                          <p className="text-sm text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedImage}
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 h-12 text-base font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Generate Prompt"
                  )}
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {generatedPrompt && (
                <motion.div
                  ref={resultRef}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Generated Prompt</h3>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-black/40 rounded-xl p-6 border border-white/10">
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {generatedPrompt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default ImageToPrompt;
