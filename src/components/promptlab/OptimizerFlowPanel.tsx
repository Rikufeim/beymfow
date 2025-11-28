import { useState, useEffect, useRef } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Send, Wand2, Loader2 } from "lucide-react";
import { usePromptLab } from "@/contexts/PromptLabContext";
import { toast } from "sonner";
import RenderMarkdown from "@/lib/renderMarkdown";
export const OptimizerFlowPanel = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    optimizerMessages,
    addOptimizerMessage
  } = usePromptLab();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [optimizerMessages]);
  const examples = [{
    title: "Optimize this prompt for SD-XL:",
    subtitle: "A portrait of a cute girl with a luminous dress"
  }, {
    title: "Create a prompt for:",
    subtitle: "a story about a future world"
  }];
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = {
      role: "user" as const,
      content: inputValue
    };
    addOptimizerMessage(userMessage);
    setInputValue("");
    setIsLoading(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prompt-optimizer`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: [...optimizerMessages, userMessage]
        })
      });
      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (resp.status === 402) {
          toast.error("Credits required. Please add credits to continue.");
        } else {
          toast.error("Failed to get response. Please try again.");
        }
        setIsLoading(false);
        return;
      }
      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      // Add placeholder for assistant message
      addOptimizerMessage({
        role: "assistant",
        content: ""
      });
      while (!streamDone) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, {
          stream: true
        });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              // Update the last message
              addOptimizerMessage({
                role: "assistant",
                content: assistantContent
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="flex flex-col h-full bg-black">
      {/* Header */}
      

      {/* Messages */}
      

      {/* Input Area */}
      
    </div>;
};