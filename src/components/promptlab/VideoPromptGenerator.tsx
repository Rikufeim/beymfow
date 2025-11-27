import { Lock } from "lucide-react";

interface VideoPromptGeneratorProps {
  toolColor: string;
}

export const VideoPromptGenerator = ({ toolColor: _toolColor }: VideoPromptGeneratorProps) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 border border-white/10">
        <div className="text-center space-y-4">
          <Lock className="w-12 h-12 text-white/50 mx-auto" />
          <p className="text-white/80 font-bold text-lg">Coming Soon</p>
          <p className="text-white/60 text-sm">Video generation will be available soon</p>
        </div>
      </div>

      <div className="opacity-30 pointer-events-none">
        <textarea
          placeholder="Describe the animation you want to create..."
          className="w-full min-h-[120px] sm:min-h-[150px] bg-black/60 border border-white/15 rounded-xl p-4 text-white placeholder:text-white/50 resize-none"
          disabled
        />
      </div>
    </div>
  );
};
