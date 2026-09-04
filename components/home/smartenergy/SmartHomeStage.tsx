"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HouseCrossSection } from "./HouseCrossSection";
import { cn } from "@/lib/cn";
import type { TechId, EnergyModel } from "./state";
import { layoutFor, DEFAULT_HOME, type HomeConfig, type SystemView } from "./three/graph";
import type { PlanLayout } from "@/lib/planLayout";
import type { LayoutView } from "./three/ExactLayout";
import type { PropertyModel } from "@/lib/property/types";
import type { PropertyViewState, PlacementState } from "./three/PropertyScene";

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

type TraceId = "energy" | "water" | "heat";

const TRACES: { id: TraceId; label: string; view: SystemView }[] = [
  { id: "energy", label: "⚡ Trace energy", view: "electricity" },
  { id: "water", label: "💧 Trace water", view: "water" },
  { id: "heat", label: "♨ Trace heat", view: "heating" },
];

/** The journey steps for each trace, derived from the current system state. */
function traceSteps(trace: TraceId, active: TechId[], isDay: boolean): { steps: string[]; hint?: string } {
  const has = (t: TechId) => active.includes(t);
  if (trace === "energy") {
    const steps: string[] = [];
    if (has("solar") && isDay) steps.push("☀ Sun", "Solar panels", "⚡ DC electricity", "Inverter · DC → AC", "Consumer unit", "Home");
    else if (has("battery")) steps.push("🔋 Battery · stored energy", "Consumer unit", "Home");
    else steps.push("Grid", "Import meter", "Consumer unit", "Home");
    if (has("solar") && isDay && has("battery")) steps.push("Surplus → 🔋 Battery");
    if (has("ev")) steps.push("→ 🚗 EV charger");
    if (!has("solar") && !has("battery")) steps.push("(add Solar & Battery to power this journey yourself)");
    return { steps };
  }
  if (trace === "water") {
    if (!has("heatpump")) return { steps: [], hint: "Add the Air Source Heat Pump to trace the hot-water journey." };
    return {
      steps: ["💧 Street water main", "Cold mains water", "Cylinder", "+ ♨ Thermal energy", "🚿 Hot water", "Shower · bath · taps"],
    };
  }
  // heat
  if (!has("heatpump")) return { steps: [], hint: "Add the Air Source Heat Pump to trace the heating journey." };
  const emitter = has("underfloor") ? "Underfloor loops" : has("thermaskirt") ? "ThermaSkirt" : "Cylinder coil";
  return {
    steps: ["♨ Outside-air energy", "+ ⚡ Electricity", "Heat pump", "🟠 Heating flow", emitter, "Room warmth", "🔵 Cooler return", "Heat pump"],
  };
}

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
  home?: HomeConfig;
  planUrl?: string | null;
  planRooms?: string[];
  layout?: PlanLayout | null;
  layoutOn?: boolean;
  property?: PropertyModel | null;
  showcaseUrl?: string | null;
  onPlaceFixture?: PlacementState["onPlace"];
  onRemoveFixture?: PlacementState["onRemove"];
  onLayoutToggle?: (on: boolean) => void;
  onPick: (id: TechId | "grid") => void;
}) {
  const [can3d, setCan3d] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mode, setMode] = useState<"3d" | "2d">("2d");
  const [view, setView] = useState<SystemView>("all");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number; flip: boolean }>({ x: 0, y: 0, flip: false });
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setCursor({ x, y, flip: x > r.width - 250 });
  };
  const nodes = layoutFor(props.home ?? DEFAULT_HOME);
  const node = hoveredNode ? nodes[hoveredNode] : null;

  const [trace, setTrace] = useState<TraceId | null>(null);
  const [layoutView, setLayoutView] = useState<LayoutView>("dollhouse");
  const [floorSel, setFloorSel] = useState<string>("all");
  const [exploded, setExploded] = useState(false);
  const [furniture, setFurniture] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [showcaseOn, setShowcaseOn] = useState(false);
  const [placing, setPlacing] = useState<"ashp" | null>(null);
  const placement: PlacementState | undefined = props.onPlaceFixture
    ? {
        placing,
        onPlace: (f) => {
          props.onPlaceFixture!(f);
          setPlacing(null);
        },
        onRemove: props.onRemoveFixture ?? (() => {}),
      }
    : undefined;
  useEffect(() => {
    if (props.showcaseUrl) setShowcaseOn(true);
  }, [props.showcaseUrl]);
  const propertyState: PropertyViewState = {
    view: layoutView,
    floor: floorSel,
    exploded,
    furniture,
    resetSignal,
  };
  const hasLayout = Boolean(props.layout?.ok || props.property || props.showcaseUrl);
  // with a showcase model loaded, the GLB is THE building view: the engine's
  // grey dollhouse stays behind the scenes (wall snapping, future design)
  const showcaseOnly = Boolean(props.showcaseUrl);

  useEffect(() => {
    const webgl = hasWebGL();
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // small screens get fewer particles too (Phase 8 mobile performance)
    setCan3d(webgl);
    setReduced(rm || window.innerWidth < 640);
    setMode(webgl ? "3d" : "2d");
  }, []);

  // a trace takes over the view mode while active
  const effectiveView = trace ? TRACES.find((t) => t.id === trace)!.view : view;
  const journey = trace ? traceSteps(trace, props.active, props.isDay) : null;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full"
      onPointerMove={onMove}
      onPointerLeave={() => setHoveredNode(null)}
    >
      {mode === "3d" && can3d ? (
        <Scene {...props} view={effectiveView} reduced={reduced} layoutView={layoutView} propertyState={propertyState} showcaseOn={showcaseOn} placement={placement} onHoverChange={setHoveredNode} />
      ) : (
        <HouseCrossSection {...props} />
      )}

      {placing && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center sm:top-20">
          <p className="rounded-full bg-navy-900/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
            Click outside the house to place the heat pump — it snaps to your outside walls
          </p>
        </div>
      )}

      {/* trace journey card */}
      {mode === "3d" && can3d && !props.layoutOn && trace && journey && (
        <div className="pointer-events-none absolute left-3 top-16 z-10 w-52 rounded-2xl bg-navy-900/90 p-3.5 backdrop-blur sm:left-4 sm:top-20">
          <p className="text-[10px] font-bold uppercase tracking-wide text-elixa-cyan">
            {trace === "energy" ? "Tracing the energy" : trace === "water" ? "Tracing the water" : "Tracing the heat"}
          </p>
          {journey.hint ? (
            <p className="mt-2 text-xs leading-snug text-white/75">{journey.hint}</p>
          ) : (
            <ol className="mt-2 grid gap-1">
              {journey.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] leading-tight text-white/85">
                  <span className="mt-px text-[9px] font-bold text-elixa-green">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* cursor-following component tooltip (screen-space; never steals the 3D pointer) */}
      {mode === "3d" && can3d && !props.layoutOn && node && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-2xl bg-navy-900/95 px-3.5 py-2.5 text-left shadow-elevated backdrop-blur"
          style={{
            left: cursor.flip ? cursor.x - 232 : cursor.x + 18,
            top: Math.max(8, cursor.y - 10),
          }}
        >
          {node.converts && (
            <span className="mb-1 inline-block rounded-full bg-elixa-cyan/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-elixa-cyan">
              {node.converts}
            </span>
          )}
          <p className="font-display text-[13px] font-bold leading-tight text-white">{node.tooltip.title}</p>
          <p className="mt-1 text-[11px] leading-snug text-white/70">{node.tooltip.body}</p>
          <p className="mt-1.5 text-[10px] font-semibold text-elixa-green">Tap for details →</p>
        </div>
      )}

      {/* view controls (bottom-centre, above the parent's legend) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
        {mode === "3d" && can3d && hasLayout && (
          <div className="pointer-events-auto flex rounded-full bg-white/85 p-1 backdrop-blur">
            {([false, true] as const).map((on) => (
              <button
                key={String(on)}
                onClick={() => props.onLayoutToggle?.(on)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold transition",
                  (props.layoutOn ?? false) === on ? "bg-elixa-gradient text-white" : "text-navy/55 hover:text-navy"
                )}
              >
                {on ? "🏗 My exact layout" : "⌂ Smart home"}
              </button>
            ))}
          </div>
        )}
        {mode === "3d" && can3d && props.layoutOn && hasLayout && !showcaseOnly && (
          <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full bg-white/85 p-1 backdrop-blur">
            {(
              [
                ["dollhouse", "🏠 Dollhouse"],
                ["full", "Full house"],
                ["plan", "Floor plan"],
                ["xray", "X-ray"],
              ] as [LayoutView, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setLayoutView(v)}
                aria-pressed={layoutView === v}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  layoutView === v ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {mode === "3d" && can3d && props.layoutOn && props.showcaseUrl && !props.property && (
          <p className="pointer-events-none rounded-full bg-white/85 px-3.5 py-1.5 text-[11px] font-semibold text-navy/55 backdrop-blur">
            Upload your floor plan to unlock floors &amp; equipment placement
          </p>
        )}
        {mode === "3d" && can3d && props.layoutOn && props.property && (
          <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full bg-white/85 p-1 backdrop-blur">
            {!showcaseOnly && [{ id: "all", name: "All floors" }, ...props.property.floors].map((f) => (
              <button
                key={f.id}
                onClick={() => setFloorSel(f.id)}
                aria-pressed={floorSel === f.id}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  floorSel === f.id ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
                )}
              >
                {f.name}
              </button>
            ))}
            {!showcaseOnly && props.property.floors.length > 1 && (
              <button
                onClick={() => setExploded((e) => !e)}
                aria-pressed={exploded}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  exploded ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
                )}
              >
                ⤢ Exploded
              </button>
            )}
            {!showcaseOnly && (
            <button
              onClick={() => setFurniture((f) => !f)}
              aria-pressed={furniture}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                furniture ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
              )}
            >
              Furniture
            </button>
            )}
            <button
              onClick={() => setResetSignal((n) => n + 1)}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-navy/55 transition hover:text-navy"
            >
              ↺ Reset view
            </button>
            <button
              onClick={() => setPlacing((p) => (p ? null : "ashp"))}
              aria-pressed={placing === "ashp"}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                placing === "ashp" ? "bg-elixa-gradient text-white" : "text-navy/55 hover:text-navy"
              )}
            >
              {placing === "ashp" ? "✕ Cancel" : "♨ Add heat pump"}
            </button>
          </div>
        )}
        {mode === "3d" && can3d && !props.layoutOn && (
          <>
            <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full bg-white/85 p-1 backdrop-blur">
              {TRACES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrace((cur) => (cur === t.id ? null : t.id))}
                  aria-pressed={trace === t.id}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                    trace === t.id ? "bg-elixa-gradient text-white" : "text-navy/55 hover:text-navy"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="pointer-events-auto flex flex-wrap justify-center gap-1 rounded-full bg-white/85 p-1 backdrop-blur">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setTrace(null);
                    setView(v.id);
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                    !trace && view === v.id ? "bg-navy text-white" : "text-navy/55 hover:text-navy"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </>
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
