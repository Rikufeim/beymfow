import React from 'react';
import { Copy, Code, ArrowLeft } from 'lucide-react';
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
  installCommand,
  importCode,
  usageCode,
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex">
      {/* Left Panel - Documentation */}
      <div className="w-full md:w-[45%] lg:w-[40%] p-8 overflow-y-auto border-r border-white/10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Components</span>
          </button>
          <span>/</span>
          <span className="text-white/70">{creator.username}</span>
          <span>/</span>
          <span className="text-white">{title}</span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-white/60 mb-8">{description}</p>

        {/* Created by */}
        <div className="mb-8">
          <h3 className="text-white/50 text-sm uppercase tracking-wider mb-3">Created by</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
              {creator.avatar ? (
                <img src={creator.avatar} alt={creator.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                creator.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-semibold">{creator.name}</div>
              <div className="text-white/50 text-sm">@{creator.username}</div>
            </div>
          </div>
        </div>

        {/* Installation */}
        <div className="mb-8">
          <h3 className="text-white/50 text-sm uppercase tracking-wider mb-3">Installation</h3>
          <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <span className="text-purple-400">npx</span>{' '}
            <span className="text-emerald-400">shadcn@latest</span>{' '}
            <span className="text-white">add</span>{' '}
            <span className="text-cyan-400">{installCommand}</span>
          </div>
        </div>

        {/* How to use */}
        <div className="mb-8">
          <h3 className="text-white/50 text-sm uppercase tracking-wider mb-3">How to use</h3>
          
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white"
              onClick={() => copyToClipboard(usageCode, 'Prompt')}
            >
              <Copy size={14} className="mr-2" />
              Copy prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white"
              onClick={() => copyToClipboard(importCode + '\n\n' + usageCode, 'Code')}
            >
              <Copy size={14} className="mr-2" />
              Copy code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white"
            >
              <Code size={14} className="mr-2" />
              View code
            </Button>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <div className="mb-4">
              <span className="text-purple-400">import</span>{' '}
              <span className="text-white">{'{ '}</span>
              <span className="text-yellow-400">{title.replace(/\s+/g, '')}</span>
              <span className="text-white">{' }'}</span>{' '}
              <span className="text-purple-400">from</span>{' '}
              <span className="text-emerald-400">"{importCode}"</span>
            </div>
            <div className="mb-2">
              <span className="text-purple-400">export default function</span>{' '}
              <span className="text-yellow-400">Home</span>
              <span className="text-white">() {'{'}</span>
            </div>
            <div className="pl-4 mb-2">
              <span className="text-purple-400">return</span>{' '}
              <span className="text-cyan-400">{'<'}</span>
              <span className="text-yellow-400">{title.replace(/\s+/g, '')}</span>
              <span className="text-cyan-400">{' />'}</span>
            </div>
            <div>
              <span className="text-white">{'}'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Video Preview */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Move cursor hint */}
        <div className="absolute bottom-1/3 right-1/4 text-white/30 text-sm tracking-[0.3em] uppercase pointer-events-none">
          MOVE CURSOR
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcasePage;
