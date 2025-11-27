import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_ERROR_MESSAGE =
  "Pahoittelut, jokin meni pieleen. Yritä hetken kuluttua uudelleen.";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  const bubbleLabel = useMemo(
    () => (isOpen ? "Sulje Beymflow AI" : "Avaa Beymflow AI"),
    [isOpen]
  );

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      const { data, error } = await supabase.functions.invoke('beymflow-chat', {
        body: { message: trimmed }
      });

      if (error) {
        throw error;
      }

      const content = data?.message?.trim();

      if (content) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Empty response body");
      }
    } catch (error) {
      console.error("Beymflow AI request failed", error);
      const fallback: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: SYSTEM_ERROR_MESSAGE,
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={bubbleLabel}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-3 py-2 text-sm rounded-full shadow-lg cursor-pointer hover:scale-105 transition z-50"
      >
        Beymflow AI
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 h-[400px] w-[280px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-white p-3 flex flex-col z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-wide">Beymflow AI</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs uppercase tracking-wider text-white/70 hover:text-white transition"
            >
              Sulje
            </button>
          </div>

          <div
            ref={messageListRef}
            className="flex-1 overflow-y-auto space-y-2 pr-1 mb-2"
          >
            {messages.length === 0 ? (
              <div className="text-xs text-white/60 leading-relaxed">
                Aloita keskustelu kertomalla, miten voimme auttaa.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`text-xs leading-relaxed ${
                    message.role === "user"
                      ? "text-cyan-200"
                      : "text-white/90"
                  }`}
                >
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-white/50">
                    {message.role === "user" ? "Sinä" : "Beymflow"}
                  </span>
                  <p className="mt-0.5">{message.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Kirjoita viesti..."
              disabled={isSending}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition"
            >
              {isSending ? "..." : "Lähetä"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
