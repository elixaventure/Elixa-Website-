"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { IconKey } from "@/content/services";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { hotspots } from "./hotspots";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-mist">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy/20 border-t-elixa-cyan" />
    </div>
  ),
});

function useCanRender3D() {
  const reduce = useReducedMotion();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (reduce) return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const smallScreen = window.matchMedia("(max-width: 640px)").matches;
      const lowCores = (navigator.hardwareConcurrency || 4) < 4;
      setOk(!!gl && !smallScreen && !lowCores);
    } catch {
      setOk(false);
    }
  }, [reduce]);
  return ok;
}

export function SmartHome3D() {
  const [active, setActive] = useState<IconKey | null>("solar");
  const [acMode, setAcMode] = useState<"cool" | "heat">("cool");
  const can3d = useCanRender3D();
  const activeSpot = hotspots.find((h) => h.id === active) ?? hotspots[0];

  const select = (id: IconKey) => {
    setActive(id);
    track("cta_click", { location: "smart-home", label: id });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
      {/* Stage */}
      <div className="relative h-[360px] overflow-hidden rounded-4xl border border-navy/10 bg-mist shadow-elevated sm:h-[460px] lg:h-[540px]">
        {can3d ? (
          <Scene active={active} acMode={acMode} onSelect={select} />
        ) : (
          <FallbackHouse active={active} onSelect={select} />
        )}

        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-navy backdrop-blur">
          {can3d ? "Drag to explore · tap a point" : "Tap a point to explore"}
        </div>
      </div>

      {/* Control / info panel */}
      <div className="flex flex-col rounded-4xl border border-navy/10 bg-white p-6 shadow-card sm:p-7">
        <div className="flex flex-wrap gap-2">
          {hotspots.map((h) => (
            <button
              key={h.id}
              onClick={() => select(h.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                active === h.id
                  ? "border-transparent bg-elixa-gradient text-white shadow-glow"
                  : "border-navy/15 text-navy/70 hover:border-elixa-cyan hover:text-navy"
              )}
            >
              <ServiceIcon name={h.id} className="h-4 w-4" />
              {h.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSpot.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 flex-1"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-elixa-gradient-soft text-navy">
                <ServiceIcon name={activeSpot.id} className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold">{activeSpot.label}</h3>
            </div>
            <p className="mt-4 text-navy/70">{activeSpot.blurb}</p>

            {activeSpot.id === "aircon" && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
                  One system, year-round
                </p>
                <div className="inline-flex rounded-full border border-navy/15 p-1">
                  {(["cool", "heat"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setAcMode(m)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                        acMode === m
                          ? m === "cool"
                            ? "bg-elixa-cyan text-white"
                            : "bg-[#f5a13a] text-white"
                          : "text-navy/60 hover:text-navy"
                      )}
                    >
                      {m === "cool" ? "❄ Cooling" : "🔥 Heating"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Link
          href={activeSpot.slug}
          className="btn-outline btn-md mt-6 self-start"
        >
          Explore {activeSpot.label}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/** Lightweight interactive SVG house for mobile / low-power / reduced-motion. */
function FallbackHouse({
  active,
  onSelect,
}: {
  active: IconKey | null;
  onSelect: (id: IconKey) => void;
}) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef5fb" />
            <stop offset="1" stopColor="#dfeaf4" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#sky)" />
        <rect x="18" y="46" width="52" height="34" fill="#f4f7fb" stroke="#ccd8e6" />
        <polygon points="14,46 44,26 74,46" fill="#1A3A6B" />
        <rect x="30" y="16" width="22" height="12" transform="skewX(-20)" fill="#12224a" />
        <rect x="60" y="60" width="10" height="18" fill="#d3dde8" />
        <rect x="6" y="64" width="12" height="10" fill="#c7d2df" />
        <rect x="82" y="58" width="4" height="20" fill="#b9c6d4" />
        <rect x="74" y="70" width="18" height="8" rx="2" fill="#1A3A6B" />
      </svg>
      {hotspots.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          aria-label={h.label}
          style={{ left: `${h.pos2d.x}%`, top: `${h.pos2d.y}%` }}
          className={cn(
            "absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white transition-all",
            active === h.id ? "scale-125 bg-elixa-cyan" : "bg-navy/80 hover:bg-elixa-cyan"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </button>
      ))}
    </div>
  );
}
