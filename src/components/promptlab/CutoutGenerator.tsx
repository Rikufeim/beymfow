import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/lib/cutout';

interface CutoutGeneratorProps {
  toolColor?: string;
}

export function CutoutGenerator({ toolColor = 'purple' }: CutoutGeneratorProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };


  const processImageAI = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    try {
      toast.info('Loading AI model... This may take a moment on first use.');
      
      // Convert data URL to blob
      const response = await fetch(originalImage);
      const blob = await response.blob();
      
      // Load image
      const img = await loadImage(blob);
      
      // Remove background using AI
      const resultBlob = await removeBackground(img);
      const resultUrl = URL.createObjectURL(resultBlob);
      
      setProcessedImage(resultUrl);
      toast.success('Background removed successfully!');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = () => {
    processImageAI();
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `cutout_${Date.now()}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Background Removal</h3>
        <div className="text-xs text-white/60">
          Powered by AI
        </div>
      </div>

      {/* Upload Area */}
      {!originalImage && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-white/60" />
          <p className="text-white/80 mb-2">Drag & drop or click to upload</p>
          <p className="text-white/60 text-sm">JPG, PNG, or WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Before/After Preview */}
      {originalImage && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-black/40 border-white/20">
            <h4 className="text-sm font-medium text-white/80 mb-2">Before</h4>
            <div className="relative aspect-square bg-white/5 rounded overflow-hidden">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          </Card>

          <Card className="p-4 bg-black/40 border-white/20">
            <h4 className="text-sm font-medium text-white/80 mb-2">After</h4>
            <div className="relative aspect-square bg-white/5 rounded overflow-hidden">
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}


      {/* Action Buttons */}
      {originalImage && (
        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
            className="flex-1 bg-black border border-purple-500/50 hover:bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Remove Background'
            )}
          </Button>

          <Button
            onClick={() => {
              setOriginalImage(null);
              setProcessedImage(null);
            }}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            Reset
          </Button>
        </div>
      )}

      {processedImage && (
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full border-white/20 hover:bg-white/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PNG
        </Button>
      )}
    </div>
  );
}
