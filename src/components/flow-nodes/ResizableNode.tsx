import React from "react";
import { Rnd } from "react-rnd";

type ResizableNodeProps = {
  id: string;
  width: number;
  height: number;
  children: React.ReactNode;
  onResizeStop: (id: string, width: number, height: number) => void;
  nodeScale?: number; // Optional scale factor if using global scaling
};

const ResizableNode: React.FC<ResizableNodeProps> = ({
  id,
  width,
  height,
  children,
  onResizeStop,
  nodeScale = 1,
}) => {
  return (
    <Rnd
      size={{ width, height }}
      minWidth={100}
      minHeight={50}
      enableResizing={{
        bottomRight: true,
        bottom: true,
        right: true,
        top: false,
        left: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
      }}
      onResizeStop={(_e, _dir, ref) => {
        const newWidth = ref.offsetWidth;
        const newHeight = ref.offsetHeight;
        onResizeStop(id, newWidth, newHeight);
      }}
      disableDragging // Dragging is handled by React Flow, not Rnd
      style={{
        transform: nodeScale !== 1 ? `scale(${nodeScale})` : undefined,
        transformOrigin: "top left",
      }}
      className="pointer-events-auto"
    >
      {children}
    </Rnd>
  );
};

export default ResizableNode;






