"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Draggable before/after comparison. Accepts image src pairs; falls back to
 * labelled gradient panels when images aren't supplied yet.
 */
export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: {
  beforeSrc?: string;
  afterSrc?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[16/10] w-full select-none overflow-hidden rounded-3xl border border-navy/10 shadow-elevated",
        className
      )}
      onMouseMove={(e) => e.buttons === 1 && move(e.clientX)}
      onTouchMove={(e) => move(e.touches[0].clientX)}
      onClick={(e) => move(e.clientX)}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
      }}
    >
      {/* After (base) */}
      <div className="absolute inset-0">
        {afterSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={afterSrc} alt={afterLabel} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-elixa-gradient">
            <span className="font-display text-lg font-bold text-white/90">{afterLabel}</span>
          </div>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {afterLabel}
        </span>
      </div>

      {/* Before (clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {beforeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beforeSrc} alt={beforeLabel} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-navy-800">
            <span className="font-display text-lg font-bold text-white/80">{beforeLabel}</span>
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-navy">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.1)]"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-elevated">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M9 7l-4 5 4 5M15 7l4 5-4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
