import { useState, useRef, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Sparkles, X, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ImagePromptChatProps {
  currentPrompt: string;
  onPromptUpdate?: (updatedPrompt: string) => void;
  onGenerateWithPrompt?: (prompt: string) => void;
  onClose?: () => void;
}

const ImagePromptChat = ({ currentPrompt, onPromptUpdate, onGenerateWithPrompt, onClose }: ImagePromptChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message only once
  useEffect(() => {
    const initialMessage: Message = {
      role: "assistant",
      content: `🎨 **AI Image Prompt Assistant**

I'm here to help you create the perfect image prompt! I can help you:

• 🖼️ Add specific visual details and composition
• 🎭 Define artistic style and mood
• 💡 Specify lighting, colors, and atmosphere
• 🔍 Add technical details (camera angles, quality)
• ✨ Refine and optimize your prompt

${currentPrompt ? `\n📝 **Your current prompt:**\n"${currentPrompt}"\n\nHow would you like to improve it?` : "Tell me what kind of image you want to create!"}`,
    };
    setMessages([initialMessage]);
  }, []); // Empty array ensures this runs only once

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage;
    const userMessage: Message = {
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const promptContext = currentPrompt ? `Current prompt: ${currentPrompt}` : "No prompt yet";

      const { data, error } = await supabase.functions.invoke("image-prompt-assistant", {
        body: {
          message: messageText,
          currentPrompt: currentPrompt,
          conversationHistory: messages.slice(1),
        },
      });

      if (error) {
        console.error("Image prompt assistant error:", error);
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If the response contains an improved prompt, extract it
      if (data.improvedPrompt && onPromptUpdate) {
        onPromptUpdate(data.improvedPrompt);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="bg-black backdrop-blur-sm border border-white/10 overflow-hidden">
        {/* Header with purple glow */}
        <div className="bg-black border-b border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">AI Image Prompt Expert</h3>
              <p className="text-xs text-muted-foreground">Precise & detailed image generation</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[450px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#a1a1aa #000000'
        }}>
          <style>{`
            .scrollbar-thin::-webkit-scrollbar {
              width: 8px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: transparent;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #000000;
              border-radius: 9999px;
              border: 2px solid #a1a1aa;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #18181b;
            }
          `}</style>
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-black border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white"
                      : "bg-black text-white border border-white/20"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-lg px-4 py-3 bg-black border border-white/20">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/20" />
                  <Skeleton className="h-4 w-64 bg-white/20" />
                  <Skeleton className="h-4 w-32 bg-white/20" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe details, style, mood, lighting..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <GlassButton
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="bg-purple-600/20"
            >
              <Send className="h-4 w-4" />
            </GlassButton>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ImagePromptChat;
