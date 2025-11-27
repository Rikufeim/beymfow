import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Zap, ChevronDown, Mic } from "lucide-react";

const BeymflowChat = () => {
  const [inputValue, setInputValue] = useState("");

  const quickActions = [
    { icon: "🔍", label: "DeepSearch" },
    { icon: "🎨", label: "Create Images" },
    { icon: "⚡", label: "How to" },
    { icon: "📁", label: "Try Projects" },
    { icon: "👤", label: "Personas" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-black font-black text-lg">B</span>
          </div>
          <span className="text-white text-2xl font-bold">Beymflow</span>
        </div>
      </div>

      {/* Main Input Container */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Input Area */}
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What do you want to know?"
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/40 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full gap-1 px-3"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Auto</span>
              <ChevronDown className="w-3 h-3" />
            </Button>

            <Button
              size="icon"
              className="bg-white text-black hover:bg-white/90 rounded-full w-10 h-10"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 px-4 pb-4 flex-wrap">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full border border-white/10 gap-2 px-4 h-9"
            >
              <span>{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-3">
          <p className="text-xs text-white/40 text-center">
            By messaging Beymflow, you agree to our{" "}
            <span className="text-white/60 hover:text-white cursor-pointer">Terms</span> and{" "}
            <span className="text-white/60 hover:text-white cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BeymflowChat;
