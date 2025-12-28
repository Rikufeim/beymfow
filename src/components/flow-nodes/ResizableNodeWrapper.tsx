import React, { useRef, useState, useEffect, createContext, useContext } from "react";

// Context to provide scale factor to children
const NodeScaleContext = createContext<number>(1);

export const useNodeScale = () => useContext(NodeScaleContext);

type ResizableNodeWrapperProps = {
  id: string;
  width: number;
  height: number;
  baseWidth?: number; // Reference width for scale calculation
  baseHeight?: number; // Reference height for scale calculation
  onResizeNode: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
};

export const ResizableNodeWrapper: React.FC<ResizableNodeWrapperProps> = ({
  id,
  width,
  height,
  baseWidth = 280,
  baseHeight = 220,
  onResizeNode,
  children,
  onMouseDown,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const currentWidth = width ?? baseWidth;
  const currentHeight = height ?? baseHeight;

  // Calculate scale factor based on size relative to base dimensions
  // Use the smaller scale to maintain aspect ratio of content
  const scaleX = currentWidth / baseWidth;
  const scaleY = currentHeight / baseHeight;
  const scale = Math.min(scaleX, scaleY);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(150, resizeStart.width + deltaX);
      const newHeight = Math.max(100, resizeStart.height + deltaY);
      
      containerRef.current.style.width = `${newWidth}px`;
      containerRef.current.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      if (!containerRef.current) return;
      
      const finalWidth = containerRef.current.offsetWidth;
      const finalHeight = containerRef.current.offsetHeight;
      
      onResizeNode(id, finalWidth, finalHeight);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, id, onResizeNode]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
  };

  return (
    <NodeScaleContext.Provider value={scale}>
      <div
        ref={containerRef}
        className={`pointer-events-auto ${className}`}
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          position: "relative",
        }}
      >
        <div 
          className="w-full h-full flex flex-col overflow-hidden" 
          onMouseDown={onMouseDown}
        >
          {children}
        </div>
        {/* Resize handle - bottom right corner */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-50 opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-neutral-500">
            <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Resize handle - bottom edge */}
        <div
          className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-40"
          onMouseDown={handleResizeStart}
        />
        {/* Resize handle - right edge */}
        <div
          className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize z-40"
          onMouseDown={handleResizeStart}
        />
      </div>
    </NodeScaleContext.Provider>
  );
};

