import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import promptThemeImage from '@/assets/prompt-theme.png';
import { X, Bot } from 'lucide-react';
import { useGuestUsage } from '@/hooks/useGuestUsage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PromptRefinerChat from './PromptRefinerChat';

const categories = [
  'Content Creation',
  'Marketing',
  'Design',
  'Business Strategy',
  'Social Media',
  'Image Creation',
  'Product Mockups'
];

interface GeneratedPrompt {
  title: string;
  prompt: string;
}

const PromptGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [selectedPromptForRefining, setSelectedPromptForRefining] = useState<GeneratedPrompt | null>(null);
  const { toast } = useToast();
  const { user, session, usageInfo, refreshUsage } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const guestUsage = useGuestUsage('guest_prompt_usage', 1);

  useEffect(() => {
    if (user && session) {
      refreshUsage();
    }
  }, [user, session]);

  // Smooth scroll to chat when it opens
  useEffect(() => {
    if (selectedPromptForRefining && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'start'
        });
      }, 100);
    }
  }, [selectedPromptForRefining]);

  const handleGenerate = async () => {
    // Check guest usage if not logged in
    if (!user) {
      if (!guestUsage.canUse) {
        toast({
          title: "Sign in required",
          description: "You've used your free generation. Please sign in to continue.",
          variant: "destructive"
        });
        setShowSubscribeDialog(true);
        return;
      }
    }

    if (!selectedCategory) {
      toast({
        title: "Select a category",
        description: "Please choose a category first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { category: selectedCategory, cost: 1 }, // Text prompts cost 1 credit
        headers
      });

      if (error) {
        // If backend indicates subscription needed for logged-in users
        if (user && ((data as any)?.requiresSubscription || (error?.message && /non-2xx|403/.test(error.message)))) {
          setShowSubscribeDialog(true);
          return;
        }
        throw error;
      }

      if (data?.prompts) {
        setGeneratedPrompts(data.prompts);
        
        // Increment guest usage if not logged in
        if (!user) {
          guestUsage.incrementUsage();
        } else {
          await refreshUsage();
        }
      }
    } catch (error: any) {
      console.error('Error generating prompts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate prompts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !session) {
      navigate('/auth');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard"
    });
  };

  return (
    <section className="py-24 px-8 lg:px-12 bg-black pb-32">
      {/* Subscribe Dialog */}
      <AlertDialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <AlertDialogContent className="bg-black border-2 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              ✨ Become a Multiply Subscriber
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center text-lg">
              {!user ? (
                <>You've used your 1 free generation. Sign in to get 5 free credits, or subscribe for unlimited generations at €9.90/month</>
              ) : (
                <>You've used your 5 free credits. Subscribe to Multiply for unlimited generations at only €9.90/month</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSubscribeDialog(false)}
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              Not Now
            </Button>
            <AlertDialogAction
              onClick={() => {
                setShowSubscribeDialog(false);
                if (!user) {
                  navigate('/auth');
                } else {
                  handleSubscribe();
                }
              }}
              className="bg-white text-black border-2 border-white/30 hover:bg-white/90 font-bold px-8 py-6 text-lg"
            >
              {!user ? 'Sign In / Create Account' : 'Subscribe for €9.90/month'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -100 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 relative py-12 min-h-[600px] rounded-xl overflow-hidden"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${promptThemeImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.3
            }}
          />
          
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          
          <div className="relative z-10 text-left pl-8 md:pl-16 lg:pl-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight chrome-text mb-8">
              <div>
                {["Business", "Prompt"].map((word, index) => (
                  <span
                    key={index}
                    className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-2 sm:mr-3 md:mr-4 my-1"
                    style={{ willChange: "transform" }}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <div>
                <span
                  className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer"
                  style={{ willChange: "transform" }}
                >
                  Generator
                </span>
              </div>
            </h2>

            <p className="text-lg text-muted-foreground mb-6">
              Generate ready made prompts to boost your creativity and projects.
            </p>

            {/* Info Bubbles */}
            <div className="mt-12 space-y-4 max-w-2xl mb-6">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-sm mb-2">💼 Why Use Our Business Prompt Generator?</h4>
                <p className="text-white/70 text-xs leading-relaxed">Generate growth strategies, ad concepts, and content ideas in seconds. Designed for entrepreneurs, marketers, and creators who move fast.</p>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 relative">
                <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
                <h4 className="text-white font-semibold text-sm mb-2">⚡ How Does It Work?</h4>
                <p className="text-white/70 text-xs leading-relaxed">Describe your business, goal, or challenge, and the system produces precise prompts to build campaigns, strategies, and product concepts instantly.</p>
              </div>
            </div>
            
            {usageInfo?.hasActiveSubscription && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg mb-4"
              >
                <span className="text-white font-semibold text-sm">✨ Multiply Subscriber</span>
              </motion.div>
            )}
            
            {!user && guestUsage.canUse && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  🎁 Try 1 free prompt generation!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid gap-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => setSelectedCategory(category)}
                className={`h-12 text-sm font-medium transition-all duration-300 bg-black text-white hover:bg-white/10 ${
                  selectedCategory === category 
                    ? "border-2 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.5)]" 
                    : "border border-white/40"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedCategory}
            variant="outline"
            className="w-full h-14 text-lg font-bold bg-black text-white border-2 border-white/40 hover:bg-white/10 transition-colors duration-300"
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Prompts'}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {generatedPrompts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Generated Prompts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedPrompts([]);
                    setSelectedPromptForRefining(null);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close All
                </Button>
              </div>
              
              <div className="grid gap-6">
                {generatedPrompts.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGeneratedPrompts(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="flex justify-between items-start gap-4 pr-8">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {item.prompt}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedPromptForRefining(item)}
                            className="gap-2"
                          >
                            <Bot className="h-4 w-4" />
                            Refine with AI
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(item.prompt)}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Refiner Chat - Separate from prompts list */}
        <AnimatePresence>
          {selectedPromptForRefining && (
            <motion.div
              ref={chatRef}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="mt-8"
            >
              <PromptRefinerChat
                selectedPrompt={selectedPromptForRefining}
                onClose={() => setSelectedPromptForRefining(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PromptGenerator;
