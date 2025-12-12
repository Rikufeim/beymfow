import React, { useRef, useState, useEffect } from "react";

type ResizableNodeWrapperProps = {
  id: string;
  width: number;
  height: number;
  onResizeNode: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
};

export const ResizableNodeWrapper: React.FC<ResizableNodeWrapperProps> = ({
  id,
  width,
  height,
  onResizeNode,
  children,
  onMouseDown,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const defaultWidth = width ?? 280;
  const defaultHeight = height ?? 220;

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(200, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);
      
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
    <div
      ref={containerRef}
      className={`pointer-events-auto ${className}`}
      style={{
        width: `${defaultWidth}px`,
        height: `${defaultHeight}px`,
        position: "relative",
      }}
    >
      <div className="w-full h-full flex flex-col" onMouseDown={onMouseDown}>
        {children}
      </div>
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-1 z-50"
        onMouseDown={handleResizeStart}
        style={{
          background: "linear-gradient(to top left, transparent 0%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 100%)",
        }}
      >
        <div className="border-r-2 border-b-2 border-neutral-600 w-2 h-2" />
      </div>
    </div>
  );
};




