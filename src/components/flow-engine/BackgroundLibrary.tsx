import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Copy,
  Check,
  Download,
  ChevronRight,
  Braces,
  Code,
  Image as ImageIcon,
  Sparkles,
  Power,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  OVERLAY_LIBRARY,
  OVERLAY_CATEGORIES,
  VARIANT_LABELS,
  filterOverlays,
  overlayLayersToCss,
  overlayCombinedCss,
  overlayTokensJson,
  type OverlayEntry,
  type OverlayCategory,
  type VariantName,
  type OverlayState,
} from "@/data/overlayBackgrounds";
import { OverlayRendererSwitch } from "./overlays";

// ─── Card placeholder by render mode (no live WebGL/Canvas in grid) ───

function CardPlaceholder({ entry }: { entry: OverlayEntry }) {
  const gradient =
    entry.category === "Space"
      ? "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(88,80,236,0.25), transparent 60%), radial-gradient(ellipse 40% 30% at 70% 30%, rgba(59,130,246,0.15), transparent 50%)"
      : entry.category === "Soft/Ambient"
        ? "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.06), transparent 70%)"
        : "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.3), transparent 60%)";
  return (
    <div
      className="absolute inset-0"
      style={{ background: gradient }}
      aria-hidden
    />
  );
}

// ─── PNG Export (capture live preview DOM: base + overlay) ────────────

async function exportCombinedPng(
  containerEl: HTMLElement | null,
  width: number,
  height: number,
  filename: string,
) {
  if (!containerEl) {
    toast.error("Preview not ready.");
    return;
  }
  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(containerEl, {
      width,
      height,
      pixelRatio: Math.min(2, window.devicePixelRatio || 1),
      cacheBust: true,
      includeQueryParams: true,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
    toast.success(`Exported ${filename}`);
  } catch (e) {
    console.error(e);
    toast.error("PNG export failed.");
  }
}

// ─── Copy Helper ────────────────────────────────────────────────────

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Detail Drawer ──────────────────────────────────────────────────

const DetailDrawer: React.FC<{
  entry: OverlayEntry;
  variant: VariantName;
  intensity: number;
  reduceMotion: boolean;
  baseBackgroundCss: string;
  overlayState: OverlayState;
  onVariantChange: (v: VariantName) => void;
  onClose: () => void;
  onApply: () => void;
}> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  baseBackgroundCss,
  overlayState,
  onVariantChange,
  onClose,
  onApply,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const detailPreviewRef = React.useRef<HTMLDivElement>(null);
  const drawerOverlayState: OverlayState = useMemo(
    () => ({ ...overlayState, variant, intensity, reduceMotion }),
    [overlayState, variant, intensity, reduceMotion],
  );

  const handleCopy = async (field: string, text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedField(field);
      toast.success(`${field} copied`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-[90vw] max-w-4xl max-h-[90vh] bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Combined Preview (base + overlay) */}
        <div ref={detailPreviewRef} className="relative aspect-video w-full flex-shrink-0">
          {/* Base background */}
          <div
            className="absolute inset-0"
            style={{ background: baseBackgroundCss }}
          />
          {/* Real-time overlay (CSS / SVG / Canvas / WebGL) */}
          <OverlayRendererSwitch
            containerRef={detailPreviewRef}
            entry={entry}
            overlayState={drawerOverlayState}
          />
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent p-6 pt-16">
            <h2 className="text-2xl font-bold text-white">{entry.name}</h2>
            <p className="text-sm text-white/50 mt-1">
              {entry.category} · {entry.renderMode}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Variant selector (no live overlay per variant to avoid multiple WebGL) */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
              Variants
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(VARIANT_LABELS) as VariantName[]).map((v) => (
                <button
                  key={v}
                  onClick={() => onVariantChange(v)}
                  className={cn(
                    "rounded-lg border overflow-hidden transition-all",
                    variant === v
                      ? "border-white/30 ring-1 ring-white/20"
                      : "border-white/10 hover:border-white/20",
                  )}
                >
                  <div className="relative aspect-video bg-neutral-900">
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{ background: baseBackgroundCss }}
                    />
                  </div>
                  <div className="px-2 py-1.5 bg-neutral-900/80 text-[10px] text-white/60 text-center">
                    {VARIANT_LABELS[v]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
              Copy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() =>
                  handleCopy(
                    "Overlay CSS",
                    overlayLayersToCss(entry, variant, intensity),
                  )
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                {copiedField === "Overlay CSS" ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Code size={14} />
                )}
                Overlay CSS
              </button>
              <button
                onClick={() =>
                  handleCopy(
                    "Combined CSS",
                    overlayCombinedCss(
                      `background: ${baseBackgroundCss};`,
                      entry,
                      variant,
                      intensity,
                    ),
                  )
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                {copiedField === "Combined CSS" ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
                Combined CSS
              </button>
              <button
                onClick={() =>
                  handleCopy(
                    "Tokens",
                    overlayTokensJson(entry, variant, intensity),
                  )
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                {copiedField === "Tokens" ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Braces size={14} />
                )}
                Tokens (JSON)
              </button>
            </div>
          </div>

          {/* Export */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
              Export PNG (base + overlay combined)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  exportCombinedPng(
                    detailPreviewRef.current,
                    1920,
                    1080,
                    `${entry.id}-${variant}-1920x1080.png`,
                  )
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                <ImageIcon size={14} />
                PNG 1920×1080
              </button>
              <button
                onClick={() =>
                  exportCombinedPng(
                    detailPreviewRef.current,
                    1080,
                    1920,
                    `${entry.id}-${variant}-1080x1920.png`,
                  )
                }
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                <ImageIcon size={14} />
                PNG 1080×1920
              </button>
            </div>
          </div>

          {/* Apply */}
          <button
            onClick={onApply}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white text-sm font-medium transition-all"
          >
            <Sparkles size={16} />
            Apply Overlay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Overlay Card ───────────────────────────────────────────────────

const OverlayCard: React.FC<{
  entry: OverlayEntry;
  variant: VariantName;
  intensity: number;
  reduceMotion: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onVariantChange: (v: VariantName) => void;
}> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  isSelected,
  onSelect,
  onVariantChange,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className={cn(
      "group rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer",
      isSelected
        ? "border-white/30 ring-1 ring-white/15 shadow-lg shadow-white/5"
        : "border-white/8 hover:border-white/20",
    )}
    onClick={onSelect}
  >
    {/* Thumbnail: placeholder (live overlay only in main preview & detail) */}
    <div className="relative aspect-video bg-neutral-950">
      <CardPlaceholder entry={entry} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    {/* Info */}
    <div className="p-3 bg-neutral-950/80">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-white truncate">
          {entry.name}
        </span>
        <ChevronRight
          size={12}
          className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {entry.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40"
          >
            {tag}
          </span>
        ))}
        {entry.tags.length > 3 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
            +{entry.tags.length - 3}
          </span>
        )}
      </div>

      {/* Variant Chips */}
      <div className="flex flex-wrap gap-1">
        {(Object.keys(VARIANT_LABELS) as VariantName[]).map((v) => (
          <button
            key={v}
            onClick={(e) => {
              e.stopPropagation();
              onVariantChange(v);
            }}
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] border transition-all",
              variant === v
                ? "bg-white/10 border-white/25 text-white/80"
                : "bg-transparent border-white/8 text-white/35 hover:text-white/60 hover:border-white/15",
            )}
          >
            {VARIANT_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Main Component ─────────────────────────────────────────────────

export interface BackgroundLibraryProps {
  overlayState: OverlayState;
  onOverlayStateChange: (update: Partial<OverlayState>) => void;
  baseBackgroundCss: string;
}

const BackgroundLibrary: React.FC<BackgroundLibraryProps> = ({
  overlayState,
  onOverlayStateChange,
  baseBackgroundCss,
}) => {
  const [activeCategory, setActiveCategory] = useState<OverlayCategory>("Space");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [cardVariants, setCardVariants] = useState<Record<string, VariantName>>({});

  // Filtering
  const filtered = useMemo(
    () =>
      filterOverlays(OVERLAY_LIBRARY, {
        category: activeCategory,
        search: searchQuery,
        tags: activeTags,
      }),
    [activeCategory, searchQuery, activeTags],
  );

  // Tags for current category
  const categoryTags = useMemo(() => {
    const all = OVERLAY_LIBRARY.filter((e) => e.category === activeCategory);
    const set = new Set<string>();
    all.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [activeCategory]);

  const selectedEntry = useMemo(
    () =>
      overlayState.id
        ? OVERLAY_LIBRARY.find((e) => e.id === overlayState.id)
        : undefined,
    [overlayState.id],
  );

  const handleSelectCard = useCallback(
    (entry: OverlayEntry) => {
      onOverlayStateChange({
        id: entry.id,
        enabled: true,
        intensity: entry.defaultIntensity,
      });
      setShowDetail(true);
    },
    [onOverlayStateChange],
  );

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleApply = useCallback(() => {
    if (selectedEntry) {
      onOverlayStateChange({ enabled: true });
      toast.success(
        `Applied "${selectedEntry.name}" overlay (${VARIANT_LABELS[overlayState.variant]})`,
      );
    }
    setShowDetail(false);
  }, [selectedEntry, overlayState.variant, onOverlayStateChange]);

  const getCardVariant = (id: string): VariantName =>
    cardVariants[id] || "soft";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Controls Bar ────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3 flex-shrink-0 flex-wrap">
        {/* On/Off */}
        <button
          onClick={() =>
            onOverlayStateChange({ enabled: !overlayState.enabled })
          }
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
            overlayState.enabled
              ? "bg-white/10 border-white/25 text-white"
              : "bg-transparent border-white/10 text-white/40 hover:text-white/60",
          )}
        >
          <Power size={12} />
          {overlayState.enabled ? "On" : "Off"}
        </button>

        {/* Intensity Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            Intensity
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={overlayState.intensity}
            onChange={(e) =>
              onOverlayStateChange({ intensity: +e.target.value })
            }
            className="w-24 h-1 accent-white/60 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-[10px] text-white/50 w-7 text-right tabular-nums">
            {overlayState.intensity}%
          </span>
        </div>

        {/* Reduce Motion */}
        <button
          onClick={() =>
            onOverlayStateChange({ reduceMotion: !overlayState.reduceMotion })
          }
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] border transition-all",
            overlayState.reduceMotion
              ? "bg-white/10 border-white/20 text-white/70"
              : "bg-transparent border-white/10 text-white/35 hover:text-white/50",
          )}
        >
          {overlayState.reduceMotion ? (
            <EyeOff size={11} />
          ) : (
            <Eye size={11} />
          )}
          {overlayState.reduceMotion ? "Motion Off" : "Motion On"}
        </button>

        {/* Selected overlay label */}
        {selectedEntry && overlayState.enabled && (
          <div className="ml-auto text-[10px] text-white/30">
            Active:{" "}
            <span className="text-white/60">{selectedEntry.name}</span> ·{" "}
            {VARIANT_LABELS[overlayState.variant]}
          </div>
        )}
      </div>

      {/* ── Library Section ─────────────────────────────── */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar */}
        <div className="w-32 flex-shrink-0 border-r border-white/10 pr-3">
          <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">
            Categories
          </label>
          <div className="space-y-1.5">
            {OVERLAY_CATEGORIES.map((cat) => {
              const count = OVERLAY_LIBRARY.filter(
                (e) => e.category === cat,
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveTags([]);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border flex items-center justify-between",
                    activeCategory === cat
                      ? "bg-neutral-900 border-white/20 text-white"
                      : "bg-neutral-900/50 border-white/10 text-white/60 hover:text-white hover:bg-neutral-800",
                  )}
                >
                  <span>{cat}</span>
                  <span className="text-[9px] text-white/30">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-2.5 min-h-0 overflow-hidden">
          {/* Header + Search */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Live Overlay Library
              </h3>
              <p className="text-[11px] text-white/40">
                {filtered.length} overlay{filtered.length !== 1 ? "s" : ""} ·
                layers on top of your base background
              </p>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-44 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Tag Filter */}
          {categoryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {categoryTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] border transition-all",
                    activeTags.includes(tag)
                      ? "bg-white/10 border-white/25 text-white"
                      : "bg-transparent border-white/10 text-white/40 hover:text-white/60 hover:border-white/15",
                  )}
                >
                  {tag}
                </button>
              ))}
              {activeTags.length > 0 && (
                <button
                  onClick={() => setActiveTags([])}
                  className="px-2 py-0.5 rounded-full text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((entry) => (
                    <OverlayCard
                      key={entry.id}
                      entry={entry}
                      variant={getCardVariant(entry.id)}
                      intensity={overlayState.intensity}
                      reduceMotion={overlayState.reduceMotion}
                      isSelected={overlayState.id === entry.id}
                      onSelect={() => handleSelectCard(entry)}
                      onVariantChange={(v) => {
                        setCardVariants((prev) => ({
                          ...prev,
                          [entry.id]: v,
                        }));
                        onOverlayStateChange({
                          id: entry.id,
                          variant: v,
                          enabled: true,
                        });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-12 text-white/30 text-sm"
                >
                  No overlays match your search.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {showDetail && selectedEntry && (
          <DetailDrawer
            entry={selectedEntry}
            variant={overlayState.variant}
            intensity={overlayState.intensity}
            reduceMotion={overlayState.reduceMotion}
            baseBackgroundCss={baseBackgroundCss}
            overlayState={overlayState}
            onVariantChange={(v) => onOverlayStateChange({ variant: v })}
            onClose={() => setShowDetail(false)}
            onApply={handleApply}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackgroundLibrary;
