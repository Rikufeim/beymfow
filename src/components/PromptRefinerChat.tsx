import { useState, useRef, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Sparkles, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PromptRefinerChatProps {
  selectedPrompt: { title: string; prompt: string };
  onClose?: () => void;
  onPromptUpdate?: (updatedPrompt: string) => void;
}

const PromptRefinerChat = ({ selectedPrompt, onClose, onPromptUpdate }: PromptRefinerChatProps) => {
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

  // Initialize with selected prompt analysis
  useEffect(() => {
    const initialMessage: Message = {
      role: "assistant",
      content: `I'm analyzing your prompt: **${selectedPrompt.title}**\n\n📝 **Current Prompt:**\n"${selectedPrompt.prompt}"\n\n✨ **What this prompt does:**\nThis prompt is designed to ${selectedPrompt.title.toLowerCase()}. It provides a structured approach to achieve the desired outcome.\n\n🎯 **How I can help:**\n• Make it more specific and detailed\n• Add constraints or requirements\n• Optimize for better AI responses\n• Adapt it to your exact use case\n\nWhat would you like to improve?`,
    };
    setMessages([initialMessage]);
  }, [selectedPrompt]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage; // Save message before clearing
    const userMessage: Message = {
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage(""); // Clear input immediately for better UX
    setIsLoading(true);

    try {
      // Build context with selected prompt
      const promptContext = `Selected prompt to refine:\nTitle: ${selectedPrompt.title}\nPrompt: ${selectedPrompt.prompt}`;

      const contextualMessage = `${promptContext}\n\nUser wants to improve this. User question: ${messageText}`;

      const { data, error } = await supabase.functions.invoke("prompt-assistant", {
        body: {
          message: contextualMessage,
          conversationHistory: messages.slice(1), // Skip initial analysis
        },
      });

      if (error) {
        console.error("Prompt assistant error:", error);
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Add error message to chat
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
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">AI Prompt Refiner</h3>
              <p className="text-xs text-muted-foreground">Refining: {selectedPrompt.title}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{
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
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-zinc-800 text-white border border-white/20"
                      : "bg-black text-white border-2 border-white/30"
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
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-black border-2 border-white/30">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/20" />
                  <Skeleton className="h-4 w-32 bg-white/20" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="How would you like to improve this prompt?"
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <GlassButton
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </GlassButton>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PromptRefinerChat;
