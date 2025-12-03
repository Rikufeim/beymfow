import React from "react";

interface NodeAnchorProps {
  type: "input" | "output";
  nodeId: string;
  onMouseDown: (e: React.MouseEvent, nodeId: string, handleType: "input" | "output") => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

// Minimal anchor used by FlowEnginePage to provide consistent connection handles
export const NodeAnchor: React.FC<NodeAnchorProps> = ({
  type,
  nodeId,
  onMouseDown,
  onDoubleClick,
  onClick,
  onMouseUp,
}) => {
  const isInput = type === "input";
  return (
    <div
      className={`node-anchor flow-handle ${isInput ? "flow-handle-target" : "flow-handle-source"}`}
      style={{
        position: "absolute",
        top: "50%",
        [isInput ? "left" : "right"]: "-10px",
        transform: "translateY(-50%)",
        width: 14,
        height: 14,
        borderRadius: "9999px",
        border: "1px solid rgba(148, 163, 184, 0.6)",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 0 6px rgba(0,0,0,0.35)",
        zIndex: 10,
        cursor: "crosshair",
      }}
      onMouseDown={(e) => onMouseDown(e, nodeId, type)}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onMouseUp={onMouseUp}
    />
  );
};

export default NodeAnchor;
