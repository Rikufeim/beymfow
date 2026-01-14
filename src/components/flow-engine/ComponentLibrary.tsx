import React from "react";
import { motion } from "framer-motion";
import { 
  Square, 
  CircleDot, 
  RectangleHorizontal, 
  ToggleLeft, 
  Type, 
  CreditCard,
  MousePointerClick,
  TextCursor,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ComponentType = 
  | "button-primary" 
  | "button-secondary" 
  | "button-ghost"
  | "card" 
  | "input" 
  | "toggle"
  | "badge"
  | "text";

interface ComponentItem {
  id: ComponentType;
  label: string;
  icon: React.ElementType;
  category: "buttons" | "inputs" | "containers" | "text";
}

const COMPONENT_ITEMS: ComponentItem[] = [
  { id: "button-primary", label: "Primary", icon: MousePointerClick, category: "buttons" },
  { id: "button-secondary", label: "Secondary", icon: RectangleHorizontal, category: "buttons" },
  { id: "button-ghost", label: "Ghost", icon: Square, category: "buttons" },
  { id: "card", label: "Card", icon: CreditCard, category: "containers" },
  { id: "input", label: "Input", icon: TextCursor, category: "inputs" },
  { id: "toggle", label: "Toggle", icon: ToggleLeft, category: "inputs" },
  { id: "badge", label: "Badge", icon: CircleDot, category: "text" },
  { id: "text", label: "Text", icon: Type, category: "text" },
];

interface ComponentLibraryProps {
  selectedComponent: ComponentType | null;
  onSelectComponent: (component: ComponentType) => void;
  isVisible: boolean;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  selectedComponent,
  onSelectComponent,
  isVisible,
}) => {
  const handleDragStart = (e: React.DragEvent, componentId: ComponentType) => {
    e.dataTransfer.setData("componentType", componentId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const categories = ["buttons", "inputs", "containers", "text"] as const;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed right-0 top-16 bottom-0 w-64 bg-black/90 backdrop-blur-xl border-l border-white/10 z-40 overflow-y-auto"
    >
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Component Library</h3>
        <p className="text-[10px] text-white/50 mb-4">
          Drag & drop to editor or click to select
        </p>

        {categories.map((category) => {
          const items = COMPONENT_ITEMS.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedComponent === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.id)}
                      onClick={() => onSelectComponent(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all group",
                        isSelected
                          ? "bg-white/10 border-white/30 ring-1 ring-white/20"
                          : "bg-neutral-900/50 border-white/10 hover:bg-neutral-800/50 hover:border-white/20"
                      )}
                    >
                      {/* Drag handle */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity">
                        <GripVertical size={10} className="text-white/50" />
                      </div>
                      
                      <Icon 
                        size={20} 
                        className={cn(
                          "transition-colors",
                          isSelected ? "text-white" : "text-white/60 group-hover:text-white/80"
                        )} 
                      />
                      <span 
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          isSelected ? "text-white" : "text-white/60 group-hover:text-white/80"
                        )}
                      >
                        {item.label}
                      </span>

                      {isSelected && (
                        <motion.div
                          layoutId="selectedComponent"
                          className="absolute inset-0 rounded-lg border-2 border-blue-500/50"
                          initial={false}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Live Preview Area */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-3">
            Live Preview
          </h4>
          <div className="bg-neutral-900/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center border border-white/10">
            {selectedComponent ? (
              <ComponentPreview type={selectedComponent} />
            ) : (
              <span className="text-[10px] text-white/30">Select a component</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ComponentPreviewProps {
  type: ComponentType;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ type }) => {
  switch (type) {
    case "button-primary":
      return (
        <button className="px-4 py-2 bg-white text-black rounded-lg text-xs font-medium hover:opacity-90 transition-all">
          Primary Button
        </button>
      );
    case "button-secondary":
      return (
        <button className="px-4 py-2 bg-transparent text-white border border-white/30 rounded-lg text-xs font-medium hover:bg-white/10 transition-all">
          Secondary Button
        </button>
      );
    case "button-ghost":
      return (
        <button className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-xs font-medium transition-all">
          Ghost Button
        </button>
      );
    case "card":
      return (
        <div className="w-full p-3 bg-white/10 border border-white/20 rounded-lg">
          <div className="h-2 bg-white/30 rounded w-3/4 mb-2" />
          <div className="h-2 bg-white/20 rounded w-1/2" />
        </div>
      );
    case "input":
      return (
        <input
          type="text"
          placeholder="Input field"
          className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
          readOnly
        />
      );
    case "toggle":
      return (
        <div className="flex items-center gap-2">
          <div className="w-10 h-5 bg-blue-500 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
          </div>
          <span className="text-xs text-white/70">Toggle</span>
        </div>
      );
    case "badge":
      return (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-medium">
          Badge
        </span>
      );
    case "text":
      return (
        <p className="text-white/70 text-xs">Sample text content</p>
      );
    default:
      return null;
  }
};

export default ComponentLibrary;
