import React, { useState } from 'react';
import { Copy, Home, Maximize2, Sun, RotateCcw, Code, Bookmark, MoreVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ComponentShowcasePageProps {
  onBack: () => void;
  videoSrc: string;
  title: string;
  description: string;
  creator: {
    name: string;
    username: string;
    avatar?: string;
  };
  installCommand: string;
  importCode: string;
  usageCode: string;
}

const ComponentShowcasePage: React.FC<ComponentShowcasePageProps> = ({
  onBack,
  videoSrc,
  title,
  description,
  creator,
  importCode,
  usageCode,
}) => {
  const [copiedButton, setCopiedButton] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedButton(label);
    setTimeout(() => setCopiedButton(null), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex overflow-hidden">
      {/* Left Panel - Documentation */}
      <div className="w-full md:w-[35%] lg:w-[30%] pl-6 pr-6 py-10 pb-20 lg:pl-8 lg:pr-10 lg:py-14 lg:pb-24 overflow-y-auto overflow-x-hidden border-r border-white/10 flex flex-col items-start">
        {/* Home Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        {/* Title & Description */}
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-white/60 mb-12 leading-relaxed">{description}</p>

        {/* How to use */}
        <div>
          <h3 className="text-white/50 text-sm uppercase tracking-wider mb-4">How to use</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            You can paste the prompt into Cursor, Gemini, Lovable, or any other AI platform. Edit and refine the code and prompt to achieve better and better results, so the final outcome looks exactly like you or your brand.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white px-4 py-2 w-fit"
              onClick={() => copyToClipboard(usageCode, 'Prompt')}
            >
              {copiedButton === 'Prompt' ? <Check size={14} className="mr-2 text-green-400" /> : <Copy size={14} className="mr-2" />}
              Copy prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white px-4 py-2 w-fit"
              onClick={() => copyToClipboard(importCode + '\n\n' + usageCode, 'Code')}
            >
              {copiedButton === 'Code' ? <Check size={14} className="mr-2 text-green-400" /> : <Copy size={14} className="mr-2" />}
              Copy code
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Video Preview */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#0a0a0a] p-4 lg:p-8">
        {/* Video Window Frame */}
        <div className="w-full h-[90vh] max-w-6xl rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/50">
          {/* Window Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d0d]">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <Maximize2 size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <Sun size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <RotateCcw size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <Code size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <Bookmark size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
          
          {/* Video Content */}
          <div className="relative w-full h-[calc(100%-52px)] bg-[#0a0a0a]">
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcasePage;
