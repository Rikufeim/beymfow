import { useState, useEffect, useRef } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { usePromptLab } from "@/contexts/PromptLabContext";
import { toast } from "sonner";
import RenderMarkdown from "@/lib/renderMarkdown";
export const AssistantChatPanel = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    assistantMessages,
    addAssistantMessage
  } = usePromptLab();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const behavior = assistantMessages.length > 1 ? "smooth" : "auto";
    container.scrollTo({
      top: container.scrollHeight,
      behavior
    });
  }, [assistantMessages]);
  const quickActions = ["Generate an eye-catching poster", "Create AI-enhanced marketing graphics"];
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = {
      role: "user" as const,
      content: inputValue
    };
    addAssistantMessage(userMessage);
    setInputValue("");
    setIsLoading(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prompt-assistant`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: [...assistantMessages, userMessage]
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
      addAssistantMessage({
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
              addAssistantMessage({
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
  return <div className="flex flex-col h-full bg-black border-r border-white/10">
      {/* Header */}
      

      {/* Messages */}
      

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-3">
          <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Ask the assistant to accomplish a task" className="bg-transparent border-none text-white placeholder:text-white/40 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 mb-2" />
          <div className="flex justify-end">
            <GlassButton onClick={handleSend} disabled={isLoading || !inputValue.trim()} size="icon">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </GlassButton>
          </div>
        </div>
      </div>
    </div>;
};