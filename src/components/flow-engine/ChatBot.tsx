import React, { useState, useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatBotProps {
  className?: string;
  template?: "landing-page" | "app" | "mobile-game";
  onEdit?: (command: string, element: string, value: string) => void;
  onHighlight?: (element: string | null) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ className, template = "landing-page", onEdit, onHighlight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;
    
    const rect = bubbleRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      const minX = 0;
      const minY = 0;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Color name to hex mapping
  const getColorHex = (colorName: string): string | null => {
    const colors: Record<string, string> = {
      // Finnish colors
      "musta": "#000000",
      "punainen": "#ff0000",
      "sininen": "#0000ff",
      "vihreä": "#00ff00",
      "keltainen": "#ffff00",
      "valkoinen": "#ffffff",
      "harmaa": "#808080",
      "oranssi": "#ffa500",
      "violetti": "#800080",
      "vaaleansininen": "#add8e6",
      "tummansininen": "#00008b",
      "vaaleanpunainen": "#ffb6c1",
      // English colors
      "black": "#000000",
      "red": "#ff0000",
      "blue": "#0000ff",
      "green": "#00ff00",
      "yellow": "#ffff00",
      "white": "#ffffff",
      "gray": "#808080",
      "grey": "#808080",
      "orange": "#ffa500",
      "purple": "#800080",
      "violet": "#800080",
      "lightblue": "#add8e6",
      "darkblue": "#00008b",
      "pink": "#ffb6c1",
    };
    
    const lower = colorName.toLowerCase().trim();
    return colors[lower] || null;
  };

  // Detect which element is being targeted (for real-time highlighting)
  const detectElement = (input: string): string | null => {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();
    
    // Button 1 by name (Get Started, Download, Play Now)
    if (lower.includes("get started") || lower.includes("getstarted") || lower.includes("aloita") ||
        lower.includes("download") || lower.includes("lataa") ||
        lower.includes("play now") || lower.includes("playnow") || lower.includes("pelaa nyt")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("background") || lower.includes("bg")) {
        if (lower.includes("tekstin") || lower.includes("text") || lower.includes("font")) {
          return "heroButton1TextColor";
        }
        return "heroButton1Color";
      }
      return "heroButton1Text";
    }
    
    // Button 2 by name (Learn More, Leaderboard)
    if (lower.includes("learn more") || lower.includes("learnmore") || lower.includes("lue lisää") ||
        lower.includes("leaderboard") || lower.includes("tulostaulu")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("background") || lower.includes("bg")) {
        if (lower.includes("tekstin") || lower.includes("text") || lower.includes("font")) {
          return "heroButton2TextColor";
        }
        return "heroButton2Color";
      }
      return "heroButton2Text";
    }
    
    // Button 1 by number/position (Finnish: nappi 1, ensimmäinen nappi, ensimmäistä nappia)
    if (lower.includes("button 1") || lower.includes("first button") || lower.includes("button1") ||
        lower.includes("nappi 1") || lower.includes("ensimmäinen nappi") || lower.includes("ensimmäistä nappia") ||
        lower.includes("nappia 1") || lower.includes("nappia1")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("background") || lower.includes("bg")) {
        if (lower.includes("tekstin") || lower.includes("text") || lower.includes("font")) {
          return "heroButton1TextColor";
        }
        return "heroButton1Color";
      }
      return "heroButton1Text";
    }
    
    // Button 2 by number/position (Finnish: nappi 2, toinen nappi, toista nappia)
    if (lower.includes("button 2") || lower.includes("second button") || lower.includes("button2") ||
        lower.includes("nappi 2") || lower.includes("toinen nappi") || lower.includes("toista nappia") ||
        lower.includes("nappia 2") || lower.includes("nappia2")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("background") || lower.includes("bg")) {
        if (lower.includes("tekstin") || lower.includes("text") || lower.includes("font")) {
          return "heroButton2TextColor";
        }
        return "heroButton2Color";
      }
      return "heroButton2Text";
    }
    
    // General "nappi" or "button" without number - assume button 1 if no other context
    if ((lower.includes("nappi") || lower.includes("button")) && !lower.includes("nappi 2") && !lower.includes("button 2") &&
        !lower.includes("toinen") && !lower.includes("second")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("background") || lower.includes("bg")) {
        if (lower.includes("tekstin") || lower.includes("text") || lower.includes("font")) {
          return "heroButton1TextColor";
        }
        return "heroButton1Color";
      }
      return "heroButton1Text";
    }
    
    // Title/heading (Finnish: otsikko, otsikkoa, titleä, titlen)
    if ((lower.includes("title") || lower.includes("heading") || lower.includes("h1") || 
         lower.includes("otsikko") || lower.includes("otsikkoa") || lower.includes("titleä") || lower.includes("titlen")) && 
        !lower.includes("button") && !lower.includes("nappi")) {
      if (lower.includes("väri") || lower.includes("color") || lower.includes("font")) {
        return "heroTextColor";
      }
      return "heroTitle";
    }
    
    // Subtitle (Finnish: alaotsikko, kuvaus, subtitleä)
    if (lower.includes("subtitle") || lower.includes("sub-title") || lower.includes("description") ||
        lower.includes("alaotsikko") || lower.includes("kuvaus") || lower.includes("subtitleä")) {
      return "heroSubtitle";
    }
    
    // General text/font color (Finnish: fontin väri, tekstin väri)
    if ((lower.includes("text color") || lower.includes("font color") || lower.includes("heading color") || 
         lower.includes("fontin väri") || lower.includes("tekstin väri") || lower.includes("fontti väri")) && 
        !lower.includes("button") && !lower.includes("nappi")) {
      return "heroTextColor";
    }
    
    return null;
  };

  const parseCommand = (input: string): { element: string; value: string } | null => {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();
    
    // Check for hex color codes anywhere in the input
    const hexMatch = trimmed.match(/#[0-9a-fA-F]{3,6}/i);
    
    // Remove command verbs first for easier parsing
    const cleaned = trimmed.replace(/^(?:muokkaa|vaihda|muuta|change|set|update)\s+/i, "").trim();
    const cleanedLower = cleaned.toLowerCase();
    
    // First, detect which element is being targeted and extract value
    let targetElement: string | null = null;
    let value: string | null = null;
    
    // Button 1 by name - check if it contains button 1 names
    const button1Names = ["get started", "getstarted", "aloita", "download", "lataa", "play now", "playnow", "pelaa nyt"];
    const isButton1 = button1Names.some(name => cleanedLower.includes(name));
    
    if (isButton1) {
      // Check for text color first (most specific)
      if (cleanedLower.includes("text color") || cleanedLower.includes("font color") || cleanedLower.includes("tekstin väri")) {
        targetElement = "heroButton1TextColor";
        const pattern = /(?:get\s+started|getstarted|aloita|download|lataa|play\s+now|playnow|pelaa\s+nyt)\s+(?:nappi|button)?\s*(?:text\s*color|font\s*color|tekstin\s*väri)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
      // Check for color (background color)
      else if (cleanedLower.includes("color") || cleanedLower.includes("background") || cleanedLower.includes("bg") || 
               cleanedLower.includes("väri") || cleanedLower.match(/\b(musta|punainen|sininen|vihreä|keltainen|valkoinen|harmaa|oranssi|violetti|black|red|blue|green|yellow|white|gray|grey|orange|purple|pink)\w*\b/i)) {
        targetElement = "heroButton1Color";
        // Try different patterns to extract color value
        const patterns = [
          /(?:get\s+started|getstarted|aloita|download|lataa|play\s+now|playnow|pelaa\s+nyt)\s+(?:nappi|button)?\s*(?:color|background|bg|väri)\s+(.+)$/i,
          /(?:get\s+started|getstarted|aloita|download|lataa|play\s+now|playnow|pelaa\s+nyt)\s+(?:nappi|button)?\s+(.+)$/i,
          /(?:get\s+started|getstarted|aloita|download|lataa|play\s+now|playnow|pelaa\s+nyt)\s+(.+)$/i,
        ];
        for (const pattern of patterns) {
          const match = cleaned.match(pattern);
          if (match && match[1]) {
            value = match[1].trim();
            // Remove "color", "väri", "background" if they're in the value
            value = value.replace(/^(?:color|väri|background|bg|nappi|button)\s+/i, "").trim();
            break;
          }
        }
      }
      // Otherwise it's button text
      else {
        targetElement = "heroButton1Text";
        const pattern = /(?:get\s+started|getstarted|aloita|download|lataa|play\s+now|playnow|pelaa\s+nyt)\s+(?:nappi|button)?\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
    }
    // Button 2 by name
    else if (cleanedLower.includes("learn more") || cleanedLower.includes("learnmore") || cleanedLower.includes("lue lisää") ||
             cleanedLower.includes("leaderboard") || cleanedLower.includes("tulostaulu")) {
      if (cleanedLower.includes("text color") || cleanedLower.includes("font color") || cleanedLower.includes("tekstin väri")) {
        targetElement = "heroButton2TextColor";
        const pattern = /(?:learn\s+more|learnmore|lue\s+lisää|leaderboard|tulostaulu)\s+(?:nappi|button)?\s*(?:text\s*color|font\s*color|tekstin\s*väri)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
      else if (cleanedLower.includes("color") || cleanedLower.includes("background") || cleanedLower.includes("bg") || 
               cleanedLower.includes("väri") || cleanedLower.match(/\b(musta|punainen|sininen|vihreä|keltainen|valkoinen|harmaa|oranssi|violetti|black|red|blue|green|yellow|white|gray|grey|orange|purple|pink)\w*\b/i)) {
        targetElement = "heroButton2Color";
        const patterns = [
          /(?:learn\s+more|learnmore|lue\s+lisää|leaderboard|tulostaulu)\s+(?:nappi|button)?\s*(?:color|background|bg|väri)\s+(.+)$/i,
          /(?:learn\s+more|learnmore|lue\s+lisää|leaderboard|tulostaulu)\s+(?:nappi|button)?\s+(.+)$/i,
          /(?:learn\s+more|learnmore|lue\s+lisää|leaderboard|tulostaulu)\s+(.+)$/i,
        ];
        for (const pattern of patterns) {
          const match = cleaned.match(pattern);
          if (match && match[1]) {
            value = match[1].trim();
            value = value.replace(/^(?:color|väri|background|bg|nappi|button)\s+/i, "").trim();
            break;
          }
        }
      }
      else {
        targetElement = "heroButton2Text";
        const pattern = /(?:learn\s+more|learnmore|lue\s+lisää|leaderboard|tulostaulu)\s+(?:nappi|button)?\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
    }
    // Button 1 by number
    else if (cleanedLower.includes("button 1") || cleanedLower.includes("first button") || cleanedLower.includes("button1") ||
             cleanedLower.includes("nappi 1") || cleanedLower.includes("ensimmäinen nappi") || cleanedLower.includes("ensimmäistä nappia") ||
             cleanedLower.includes("nappia 1") || cleanedLower.includes("nappia1")) {
      if (cleanedLower.includes("text color") || cleanedLower.includes("font color") || cleanedLower.includes("tekstin väri")) {
        targetElement = "heroButton1TextColor";
        const pattern = /(?:button\s*1|first\s*button|button1|nappi\s*1|ensimmäinen\s*nappi|ensimmäistä\s*nappia|nappia\s*1|nappia1)\s+(?:text\s*color|font\s*color|tekstin\s*väri)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
      else if (cleanedLower.includes("color") || cleanedLower.includes("background") || cleanedLower.includes("bg") || 
               cleanedLower.includes("väri") || cleanedLower.match(/\b(musta|punainen|sininen|vihreä|keltainen|valkoinen|harmaa|oranssi|violetti|black|red|blue|green|yellow|white|gray|grey|orange|purple|pink)\w*\b/i)) {
        targetElement = "heroButton1Color";
        const patterns = [
          /(?:button\s*1|first\s*button|button1|nappi\s*1|ensimmäinen\s*nappi|ensimmäistä\s*nappia|nappia\s*1|nappia1)\s+(?:color|background|bg|väri)\s+(.+)$/i,
          /(?:button\s*1|first\s*button|button1|nappi\s*1|ensimmäinen\s*nappi|ensimmäistä\s*nappia|nappia\s*1|nappia1)\s+(.+)$/i,
        ];
        for (const pattern of patterns) {
          const match = cleaned.match(pattern);
          if (match && match[1]) {
            value = match[1].trim();
            value = value.replace(/^(?:color|väri|background|bg|nappi|button)\s+/i, "").trim();
            break;
          }
        }
      }
      else {
        targetElement = "heroButton1Text";
        const pattern = /(?:button\s*1|first\s*button|button1|nappi\s*1|ensimmäinen\s*nappi|ensimmäistä\s*nappia|nappia\s*1|nappia1)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
    }
    // Button 2 by number
    else if (cleanedLower.includes("button 2") || cleanedLower.includes("second button") || cleanedLower.includes("button2") ||
             cleanedLower.includes("nappi 2") || cleanedLower.includes("toinen nappi") || cleanedLower.includes("toista nappia") ||
             cleanedLower.includes("nappia 2") || cleanedLower.includes("nappia2")) {
      if (cleanedLower.includes("text color") || cleanedLower.includes("font color") || cleanedLower.includes("tekstin väri")) {
        targetElement = "heroButton2TextColor";
        const pattern = /(?:button\s*2|second\s*button|button2|nappi\s*2|toinen\s*nappi|toista\s*nappia|nappia\s*2|nappia2)\s+(?:text\s*color|font\s*color|tekstin\s*väri)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
      else if (cleanedLower.includes("color") || cleanedLower.includes("background") || cleanedLower.includes("bg") || 
               cleanedLower.includes("väri") || cleanedLower.match(/\b(musta|punainen|sininen|vihreä|keltainen|valkoinen|harmaa|oranssi|violetti|black|red|blue|green|yellow|white|gray|grey|orange|purple|pink)\w*\b/i)) {
        targetElement = "heroButton2Color";
        const patterns = [
          /(?:button\s*2|second\s*button|button2|nappi\s*2|toinen\s*nappi|toista\s*nappia|nappia\s*2|nappia2)\s+(?:color|background|bg|väri)\s+(.+)$/i,
          /(?:button\s*2|second\s*button|button2|nappi\s*2|toinen\s*nappi|toista\s*nappia|nappia\s*2|nappia2)\s+(.+)$/i,
        ];
        for (const pattern of patterns) {
          const match = cleaned.match(pattern);
          if (match && match[1]) {
            value = match[1].trim();
            value = value.replace(/^(?:color|väri|background|bg|nappi|button)\s+/i, "").trim();
            break;
          }
        }
      }
      else {
        targetElement = "heroButton2Text";
        const pattern = /(?:button\s*2|second\s*button|button2|nappi\s*2|toinen\s*nappi|toista\s*nappia|nappia\s*2|nappia2)\s+(.+)$/i;
        const match = cleaned.match(pattern);
        value = match ? match[1].trim() : null;
      }
    }
    // General text/font color
    else if ((cleanedLower.includes("text color") || cleanedLower.includes("font color") || cleanedLower.includes("heading color") || 
              cleanedLower.includes("fontin väri") || cleanedLower.includes("tekstin väri") || cleanedLower.includes("fontti väri")) && 
             !cleanedLower.includes("button") && !cleanedLower.includes("nappi")) {
      targetElement = "heroTextColor";
      const pattern = /(?:text\s*color|font\s*color|heading\s*color|fontin\s*väri|tekstin\s*väri|fontti\s*väri)\s+(.+)$/i;
      const match = cleaned.match(pattern);
      value = match ? match[1].trim() : null;
    }
    // Title/heading with color
    else if ((cleanedLower.includes("title") || cleanedLower.includes("heading") || cleanedLower.includes("h1") ||
              cleanedLower.includes("otsikko") || cleanedLower.includes("otsikkoa") || cleanedLower.includes("titleä") || cleanedLower.includes("titlen")) && 
             (cleanedLower.includes("color") || cleanedLower.includes("väri")) && 
             !cleanedLower.includes("button") && !cleanedLower.includes("nappi")) {
      targetElement = "heroTextColor";
      const pattern = /(?:title|heading|h1|otsikko|otsikkoa|titleä|titlen)\s+(?:color|väri)\s+(.+)$/i;
      const match = cleaned.match(pattern);
      value = match ? match[1].trim() : null;
    }
    // Title/heading text
    else if ((cleanedLower.includes("title") || cleanedLower.includes("heading") || cleanedLower.includes("h1") ||
              cleanedLower.includes("otsikko") || cleanedLower.includes("otsikkoa") || cleanedLower.includes("titleä") || cleanedLower.includes("titlen")) && 
             !cleanedLower.includes("button") && !cleanedLower.includes("nappi")) {
      targetElement = "heroTitle";
      const pattern = /(?:title|heading|h1|otsikko|otsikkoa|titleä|titlen)\s+(.+)$/i;
      const match = cleaned.match(pattern);
      value = match ? match[1].trim() : null;
    }
    // Subtitle
    else if (cleanedLower.includes("subtitle") || cleanedLower.includes("sub-title") || cleanedLower.includes("description") ||
             cleanedLower.includes("alaotsikko") || cleanedLower.includes("kuvaus") || cleanedLower.includes("subtitleä")) {
      targetElement = "heroSubtitle";
      const pattern = /(?:subtitle|sub-title|description|alaotsikko|kuvaus|subtitleä)\s+(.+)$/i;
      const match = cleaned.match(pattern);
      value = match ? match[1].trim() : null;
    }
    
    if (!targetElement || !value) return null;
    
    if (!value || value.length === 0) return null;
    
    // For color elements, handle hex codes and color names
    if (targetElement.includes("Color")) {
      if (hexMatch) {
        return { element: targetElement, value: hexMatch[0] };
      }
      
      // Try to convert color name to hex
      const colorHex = getColorHex(value);
      if (colorHex) {
        return { element: targetElement, value: colorHex };
      }
      
      // Try to extract color value, might be a hex without #
      const colorMatch = value.match(/^(?:#)?([0-9a-fA-F]{3,6})$/i);
      if (colorMatch) {
        return { element: targetElement, value: `#${colorMatch[1]}` };
      }
      
      // Remove common suffixes like "ksi", "ksi", "ksi" (Finnish: mustaksi, punaiseksi)
      const cleanedValue = value.replace(/ksi$/i, "").trim();
      const cleanedColorHex = getColorHex(cleanedValue);
      if (cleanedColorHex) {
        return { element: targetElement, value: cleanedColorHex };
      }
      
      // Otherwise return the value as-is
      return { element: targetElement, value };
    }
    
    // For text elements, return the value as-is
    return { element: targetElement, value };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    
    const command = inputRef.current.value.trim();
    if (!command) {
      if (onHighlight) onHighlight(null);
      setIsOpen(false);
      return;
    }
    
    if (onEdit) {
      const parsed = parseCommand(command);
      if (parsed && parsed.element && parsed.value) {
        onEdit(command, parsed.element, parsed.value);
        // Keep highlight for 2 seconds after edit
        setTimeout(() => {
          if (onHighlight) onHighlight(null);
        }, 2000);
      } else {
        // Command not recognized, clear highlight
        if (onHighlight) onHighlight(null);
      }
    }
    
    inputRef.current.value = "";
    inputRef.current.blur();
    setIsOpen(false);
  };
  
  // Clear highlight when chat closes
  useEffect(() => {
    if (!isOpen && onHighlight) {
      onHighlight(null);
    }
  }, [isOpen, onHighlight]);

  return (
    <div
      className={cn("fixed z-[60] pointer-events-auto", className)}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Chat Bubble */}
      <div
        ref={bubbleRef}
        onMouseDown={handleMouseDown}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-black border-2 border-white/20 flex items-center justify-center cursor-move hover:border-white/40 transition-all shadow-lg",
          isDragging && "scale-110 cursor-grabbing",
          !isDragging && "cursor-grab"
        )}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </div>

      {/* Chat Input */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3"
            style={{ transform: "translateX(calc(50% - 28px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="w-64 px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-white/30 focus-visible:border-white/30"
                autoFocus
                onChange={(e) => {
                  // Real-time highlighting as user types
                  if (onHighlight) {
                    const detected = detectElement(e.target.value);
                    onHighlight(detected);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (onHighlight) onHighlight(null);
                    setIsOpen(false);
                  }
                }}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

