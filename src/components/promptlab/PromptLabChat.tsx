import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Crown, Puzzle } from "lucide-react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

type Mode = "chat" | "optimize" | "premium";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggest?: string;
};

function Field({ label, value, onChange, suggest }: FieldProps) {
  return (
    <label className="block relative">
      <span className="text-xs uppercase tracking-wide text-white/60">{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
        />
        {suggest ? (
          <button
            type="button"
            onClick={() => onChange(suggest)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/80 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/10 hover:bg-black"
          >
            {suggest}
          </button>
        ) : null}
      </div>
    </label>
  );
}

const deriveSuggestions = (text: string): string[] => {
  const value = (text || "").toLowerCase();
  const options: string[] = [];
  const push = (suggestion: string) => {
    if (!options.includes(suggestion) && options.length < 3) {
      options.push(suggestion);
    }
  };

  if (!value.trim()) return [];
  if (/prompt|idea|improve/.test(value)) {
    push("Make prompt more detailed");
    push("Add context");
    push("Refine tone and clarity");
    return options;
  }

  push("Add examples");
  push("Step-by-step");
  push("Make it creative");

  return options;
};

export default function PromptLabChat() {
  const [mode, setMode] = useState<Mode>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [style, setStyle] = useState("");
  const [tone, setTone] = useState("");
  const [constraints, setConstraints] = useState("");
  const [length, setLength] = useState("");
  const [extras, setExtras] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const element = listRef.current;
    if (element) {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    setSuggestions(deriveSuggestions(input));
  }, [input]);

  const buildPrompt = (userText: string) => {
    if (!userText.trim()) return "";

    const prompt = `Goal: ${goal || "unspecified"}\nAudience: ${audience || "general"}\nStyle: ${style || "clear and engaging"}\nTone: ${tone || "helpful and confident"}\nConstraints: ${constraints || "none"}\nLength: ${length || "medium"}\nExtras: ${extras || "none"}\n\nPrompt task: ${userText}`;

    return prompt;
  };

  const sendMessage = async (text: string) => {
    const value = text.trim();
    if (!value) return;

    const userMessage: Msg = { id: crypto.randomUUID(), role: "user", text: value };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, role: "assistant", text: "" }]);
    setLoadingId(id);

    try {
      const currentMessages = [...messages, userMessage];
      const userPrompt = optionsOpen ? buildPrompt(value) : value;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an intelligent AI assistant that can generate prompts or have normal conversations.",
            },
            ...currentMessages.map((message) => ({ role: message.role, content: message.text })),
            { role: "user", content: userPrompt },
          ],
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "I wasn’t able to generate a response.";

      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, text: content } : message)));
    } catch {
      const fallback = `Here’s a useful prompt draft for you:\n\n${buildPrompt(value)}`;
      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, text: fallback } : message)));
    } finally {
      setLoadingId(null);
    }
  };

  const onSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text) return;
    void sendMessage(text);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative h-[calc(100svh-72px)] w-full overflow-hidden bg-transparent">
      <div className="relative mx-auto flex h-full max-w-4xl flex-col px-4 sm:px-6">
        <div ref={listRef} className="mt-2 flex-1 overflow-y-auto bg-transparent p-3 sm:p-4">
          <div className="mx-auto max-w-2xl">
            {suggestions.length > 0 ? (
              <div className="sticky top-0 z-10 mb-3 bg-gradient-to-b from-black/40 to-transparent px-1 py-2 backdrop-blur">
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput((previous) => (previous ? `${previous} ${suggestion}` : suggestion));
                        setSuggestions([]);
                      }}
                      className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="mb-3 sm:mb-4"
                >
                  <div
                    className={`inline-block max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ring-1 backdrop-blur ${
                      message.role === "user" ? "bg-white/5 ring-white/10" : "bg-black/30 ring-white/10"
                    }`}
                  >
                    <p className="text-base text-white/90 whitespace-pre-line">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {optionsOpen ? (
              <motion.div
                key="builder-inline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mb-3 rounded-2xl border border-white/12 bg-black/60 p-3 backdrop-blur"
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Goal" value={goal} onChange={setGoal} suggest="online business" />
                  <Field label="Audience" value={audience} onChange={setAudience} suggest="entrepreneurs" />
                  <Field label="Style" value={style} onChange={setStyle} suggest="minimalistic and visual" />
                  <Field label="Tone" value={tone} onChange={setTone} suggest="confident and modern" />
                  <Field
                    label="Constraints"
                    value={constraints}
                    onChange={setConstraints}
                    suggest="keep it under 300 words"
                  />
                  <Field label="Length" value={length} onChange={setLength} suggest="medium length" />
                  <Field label="Extras" value={extras} onChange={setExtras} suggest="add key takeaways" />
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-4 z-10 mt-2 w-full">
          <form onSubmit={onSubmit} className="flex w-full items-center">
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-white/15 bg-white/5 p-2 backdrop-blur-md">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5"
                aria-label="Attach"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="your idea…"
                className="flex-1 bg-transparent px-1 text-base text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-medium text-black transition hover:bg-white"
                disabled={Boolean(loadingId)}
              >
                <Send className="h-4 w-4" />
                <span>{loadingId ? "Thinking…" : "Send"}</span>
              </button>
            </div>
          </form>
          <div className="mx-auto mt-3 flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setMode("optimize")}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                mode === "optimize" ? "bg-white/10 border-white/20" : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <Puzzle className="h-4 w-4" /> Optimize
            </button>
            <button
              onClick={() => setMode("premium")}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                mode === "premium" ? "bg-white/10 border-white/20" : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
            >
              <Crown className="h-4 w-4" /> Beymflow Premium
            </button>
            <button
              onClick={() => setOptionsOpen((previous) => !previous)}
              className={`rounded-full border border-white/15 px-4 py-2 text-sm ${
                optionsOpen ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              Build Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
