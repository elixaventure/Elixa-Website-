"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HouseCrossSection } from "./HouseCrossSection";
import { cn } from "@/lib/cn";
import type { TechId, EnergyModel } from "./state";
import type { SystemView } from "./three/graph";

const Scene = dynamic(() => import("./three/Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="flex items-center gap-2 text-sm text-navy/50">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/20 border-t-elixa-cyan" />
        Loading the interactive home…
      </span>
    </div>
  ),
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

const VIEWS: { id: SystemView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "electricity", label: "Electricity" },
  { id: "water", label: "Water" },
  { id: "heating", label: "Heating" },
  { id: "cooling", label: "Cooling" },
];

/**
 * Central visual for the Smart Energy Home. Renders the premium interactive 3D
 * scene when the device supports it, and falls back to the 2D cross-section
 * (which also stays available via the Schematic toggle and for reduced-motion /
 * no-WebGL). Identical prop contract to HouseCrossSection — drop-in.
 */
export function SmartHomeStage(props: {
  active: TechId[];
  isDay: boolean;
  acMode: "cool" | "heat";
  model: EnergyModel;
  flowMode: boolean;
  onPick: (id: TechId | "grid") => void;
}) {
  const [can3d, setCan3d] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mode, setMode] = useState<"3d" | "2d">("2d");
  const [view, setView] = useState<SystemView>("all");

  useEffect(() => {
    const webgl = hasWebGL();
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCan3d(webgl);
    setReduced(rm);
    setMode(webgl ? "3d" : "2d");
  }, []);

  return (
    <div className="relative h-full w-full">
      {mode === "3d" && can3d ? (
        <Scene {...props} view={view} reduced={reduced} />
      ) : (
        <HouseCrossSection {...props} />
      )}

      {/* view controls (bottom-centre, above the parent's legend) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
        {mode === "3d" && can3d && (
          <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full bg-white/85 p-1 backdrop-blur">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  view === v.id ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D / schematic toggle (top-centre) */}
      {can3d && (
        <div className="pointer-events-auto absolute left-1/2 bottom-16 z-10 -translate-x-1/2 sm:bottom-auto sm:top-4">
          <div className="inline-flex rounded-full bg-white/85 p-1 shadow-card backdrop-blur">
            {(["3d", "2d"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  mode === m ? "bg-elixa-gradient text-white" : "text-navy/60"
                )}
              >
                {m === "3d" ? "3D home" : "Schematic"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
