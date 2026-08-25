"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { savePlan, loadPlan, clearPlan, savePlanPreview, loadPlanPreview, savePlanAnalysis, loadPlanAnalysis, savePlanLayout, loadPlanLayout, savePlanArea, loadPlanArea, saveFloors, loadFloors, saveShowcaseModel, loadShowcaseModel } from "@/lib/planStore";
import { makePlanPreview } from "@/lib/planPreview";
import { analysePlan, type PlanAnalysis } from "@/lib/planAnalysis";
import { extractLayout, type PlanLayout } from "@/lib/planLayout";
import { planApiConfigured, recognisePlan } from "@/lib/planApi";
import { adaptRecognition } from "@/lib/planAdapter";
import { floorFromLayout } from "@/lib/property/fromLayout";
import type { PropertyModel } from "@/lib/property/types";
import { DEFAULT_CEILING_HEIGHT } from "@/lib/property/constants";
import goldenProperty001 from "@/golden-tests/property-001/expected-property.json";
import type { PlanDebug } from "@/lib/planLayoutDebug";
import { applyScale } from "@/lib/houseModel";
import { PlanDebugPanel } from "./PlanDebugPanel";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { SmartHomeStage } from "./SmartHomeStage";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import {
  TECHS,
  techById,
  TECH_TO_SERVICE_SLUG,
  computeEnergy,
  energyScore,
  gridDependency,
  comboMessage,
  COMPLETE_HOME,
  SCORE_TOOLTIP,
  FLOW_COLORS,
  type TechId,
} from "./state";

interface FloorRec {
  id: string;
  name: string;
  level: number;
  ceilingHeight: number;
  layout: PlanLayout | null;
}

const DEFAULT_GROUND: FloorRec = { id: "ground", name: "Ground Floor", level: 0, ceilingHeight: DEFAULT_CEILING_HEIGHT, layout: null };

const FLOOR_NAMES = ["Ground Floor", "First Floor", "Second Floor", "Third Floor"];

export function SmartEnergyHome() {
  const [selected, setSelected] = useState<Set<TechId>>(new Set(["solar"]));
  const [isDay, setIsDay] = useState(true);
  const [flowMode, setFlowMode] = useState(false);
  const [acMode, setAcMode] = useState<"cool" | "heat">("cool");
  const [picked, setPicked] = useState<TechId | "grid" | null>(null);
  const [finale, setFinale] = useState(false);
  const [home, setHome] = useState<{ bedrooms: 2 | 3 | 4 | 5; storeys: 1 | 2 }>({ bedrooms: 3, storeys: 2 });
  const [planName, setPlanName] = useState<string | null>(null);
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [planRead, setPlanRead] = useState<PlanAnalysis | null>(null);
  const [planLayout, setPlanLayout] = useState<PlanLayout | null>(null);
  const [planAreaM2, setPlanAreaM2] = useState<number | null>(null);
  const [layoutOn, setLayoutOn] = useState(false);
  // multi-floor: each customer floor plan is assigned to one of these
  const [floorsData, setFloorsData] = useState<FloorRec[]>([DEFAULT_GROUND]);
  const [activeFloorId, setActiveFloorId] = useState("ground");
  const activeFloorRef = useRef("ground");
  activeFloorRef.current = activeFloorId;
  // canonical/golden property preview via ?demoProperty=<id>
  const [demoProp, setDemoProp] = useState<PropertyModel | null>(null);
  // a pre-built showcase GLB (public/models/showcase-apartment.glb) lights up
  // an extra "Showcase" view when the file exists in the deploy
  const [showcaseUrl, setShowcaseUrl] = useState<string | null>(null);
  // TEMPORARY: extraction diagnostics, opt-in via ?planDebug=1
  const [planDebug, setPlanDebug] = useState<PlanDebug | null>(null);
  const debugOn = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const applyAnalysis = (a: PlanAnalysis | null) => {
    if (!a) return;
    setPlanRead(a);
    if (a.areaM2) {
      setPlanAreaM2((cur) => cur ?? a.areaM2!);
      savePlanArea(a.areaM2);
    }
    setHome((h) => ({
      bedrooms: a.bedrooms ?? h.bedrooms,
      storeys: a.storeys ?? h.storeys,
    }));
  };

  const setPreviewUrl = (blob: Blob | null) => {
    setPlanUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return blob ? URL.createObjectURL(blob) : null;
    });
  };

  /** keep the (large) debug payload out of IndexedDB and out of the 3D props */
  const acceptLayout = (l: (PlanLayout & { debug?: PlanDebug }) | null) => {
    if (!l) return;
    const { debug, ...clean } = l;
    savePlanLayout(clean);
    setPlanLayout(clean);
    setFloorsData((fs) => {
      const next = fs.map((f) => (f.id === activeFloorRef.current ? { ...f, layout: clean } : f));
      saveFloors(next);
      return next;
    });
    if (debug) setPlanDebug(debug);
  };

  // a previously uploaded floor plan (it carries through to the quote)
  useEffect(() => {
    debugOn.current =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).get("planDebug") === "1";
    loadPlan().then((f) => f && setPlanName(f.name));
    loadPlanPreview().then((b) => {
      if (!b) return;
      setPreviewUrl(b);
      // with the flag on, re-run extraction over the stored plan so the
      // diagnostics are available on reload without re-uploading
      if (debugOn.current) extractLayout(b, { debug: true }).then(acceptLayout);
    });
    loadPlanAnalysis<PlanAnalysis>().then((a) => applyAnalysis(a));
    loadFloors<FloorRec[]>().then((fs) => {
      if (fs?.length) setFloorsData(fs);
    });
    loadPlanLayout<PlanLayout>().then((l) => {
      if (!l) return;
      setPlanLayout(l);
      // migrate a legacy single-layout store into the ground floor record
      setFloorsData((fs) => (fs.some((f) => f.layout) ? fs : fs.map((f) => (f.id === "ground" ? { ...f, layout: l } : f))));
    });
    // a model the customer uploaded locally wins over a deployed showcase file
    loadShowcaseModel().then((blob) => {
      if (blob) {
        setShowcaseUrl(URL.createObjectURL(blob));
        setLayoutOn(true);
        return;
      }
      const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
      const url = `${base}/models/showcase-apartment.glb`;
      fetch(url, { method: "HEAD" })
        .then((r) => {
          if (r.ok && !(r.headers.get("content-type") || "").includes("text/html")) setShowcaseUrl(url);
        })
        .catch(() => {});
    });
    const demo = new URLSearchParams(window.location.search).get("demoProperty");
    if (demo === "1" || demo === "property-001") {
      setDemoProp(goldenProperty001 as unknown as PropertyModel);
      setLayoutOn(true);
    }
    loadPlanArea().then((n) => n && setPlanAreaM2(n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // attach real-world scale to the layout whenever a floor area is known.
  // applyScale always returns a NEW object, and leaves scale null when the
  // area cannot be resolved (e.g. a layout stored before metrics existed), so
  // the scale field alone cannot tell us we already tried: remember the object
  // we produced and the area we produced it for, or the effect re-triggers on
  // its own output forever.
  const scaledOut = useRef<{ layout: PlanLayout; areaM2: number } | null>(null);
  useEffect(() => {
    if (!planLayout?.ok || !planAreaM2) return;
    if (scaledOut.current?.layout === planLayout && scaledOut.current.areaM2 === planAreaM2) return;
    if (planLayout.scale && planLayout.scale.areaM2 === planAreaM2) return;
    const scaled = applyScale(planLayout, planAreaM2);
    scaledOut.current = { layout: scaled, areaM2: planAreaM2 };
    savePlanLayout(scaled);
    setPlanLayout(scaled);
    setFloorsData((fs) => {
      const next = fs.map((f) => (f.layout === planLayout ? { ...f, layout: scaled } : f));
      saveFloors(next);
      return next;
    });
  }, [planLayout, planAreaM2]);

  const property = useMemo<PropertyModel | null>(() => {
    if (demoProp) return demoProp;
    const floors = floorsData
      .filter((f) => f.layout?.ok)
      .map((f) =>
        floorFromLayout(f.layout!, {
          id: f.id,
          name: f.name,
          level: f.level,
          ceilingHeight: f.ceilingHeight,
          planTextureUrl: f.level === 0 ? planUrl ?? undefined : undefined,
        }),
      )
      .filter((f): f is NonNullable<typeof f> => f !== null);
    if (!floors.length) return null;
    return { propertyId: "customer-property", floors, source: "extracted" };
  }, [demoProp, floorsData, planUrl]);

  const active = useMemo(() => Array.from(selected), [selected]);
  const model = useMemo(() => computeEnergy(selected, isDay, home), [selected, isDay, home]);
  const { score, label } = useMemo(() => energyScore(selected), [selected]);
  const grid = useMemo(() => gridDependency(model), [model]);
  const combo = useMemo(() => comboMessage(selected), [selected]);
  const greenness = Math.max(0, Math.min(1, (score - 42) / (96 - 42)));

  const toggle = (id: TechId) => {
    setFinale(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        track("cta_click", { location: "smart-energy-home", label: `add:${id}` });
      }
      return next;
    });
  };

  const buildComplete = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFinale(false);
    setFlowMode(true);
    setIsDay(true);
    track("cta_click", { location: "smart-energy-home", label: "build-complete" });
    let acc: TechId[] = [];
    COMPLETE_HOME.forEach((t, i) => {
      timers.current.push(
        setTimeout(() => {
          acc = [...acc, t];
          setSelected(new Set(acc));
        }, 500 + i * 900)
      );
    });
    timers.current.push(setTimeout(() => setFinale(true), 500 + COMPLETE_HOME.length * 900 + 700));
  };

  const quoteHref = useMemo(() => {
    const techs = active.map((t) => TECH_TO_SERVICE_SLUG[t]).join(",");
    return techs ? `/quote?tech=${techs}` : "/quote";
  }, [active]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      {/* ================= STAGE ================= */}
      <div
        className="relative h-[440px] min-w-0 overflow-hidden rounded-4xl border border-navy/10 shadow-elevated sm:h-[520px] lg:h-[640px]"
        style={{
          background: isDay
            ? "linear-gradient(180deg,#dcecf8,#e7f1ea)"
            : "linear-gradient(180deg,#16233f,#0d1730)",
        }}
      >
        <SmartHomeStage
          active={active}
          isDay={isDay}
          acMode={acMode}
          model={model}
          flowMode={flowMode}
          home={home}
          planUrl={planUrl}
          planRooms={planRead?.rooms}
          layout={planLayout}
          property={property}
          showcaseUrl={showcaseUrl}
          layoutOn={layoutOn}
          onLayoutToggle={setLayoutOn}
          onPick={(id) => setPicked(id)}
        />

        {/* overlay chips: day/night + flow */}
        <div className="pointer-events-auto absolute left-4 top-4 flex flex-wrap gap-2">
          <div className="inline-flex rounded-full bg-white/85 p-1 backdrop-blur">
            {([true, false] as const).map((d) => (
              <button
                key={String(d)}
                onClick={() => setIsDay(d)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  isDay === d ? "bg-navy text-white" : "text-navy/60"
                )}
              >
                {d ? "☀ Day" : "🌙 Night"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFlowMode((v) => !v)}
            className={cn(
              "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur transition",
              flowMode ? "bg-elixa-cyan text-white" : "bg-white/85 text-navy/70"
            )}
          >
            ⚡ Focus flows
          </button>
        </div>

        {/* live dashboard (compact, overlaid) */}
        <Dashboard model={model} isDay={isDay} />

        {/* flow legend */}
        <FlowLegend />

        {/* equipment info bottom sheet */}
        <AnimatePresence>
          {picked && <EquipmentSheet picked={picked} selected={selected} onToggle={toggle} onClose={() => setPicked(null)} />}
        </AnimatePresence>

        {/* finale overlay */}
        <AnimatePresence>{finale && <Finale quoteHref={quoteHref} onClose={() => setFinale(false)} />}</AnimatePresence>
      </div>

      {/* ================= CONTROL PANEL ================= */}
      <div className="flex min-w-0 flex-col gap-4">
        {/* score + grid */}
        <div className="rounded-4xl border border-navy/10 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-navy/50">Illustrative Elixa Energy Score</span>
                <span className="group relative cursor-help text-navy/40" tabIndex={0} aria-label={SCORE_TOOLTIP}>
                  ⓘ
                  <span className="pointer-events-none absolute left-1/2 top-6 z-20 w-60 -translate-x-1/2 rounded-xl bg-navy px-3 py-2 text-xs font-normal normal-case tracking-normal text-white opacity-0 shadow-elevated transition group-hover:opacity-100 group-focus:opacity-100">
                    {SCORE_TOOLTIP}
                  </span>
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <motion.span
                  key={score}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-4xl font-extrabold text-navy"
                >
                  {score}
                </motion.span>
                <span className="text-navy/40">/ 100</span>
              </div>
              <span className="mt-1 inline-block text-sm font-semibold text-elixa-green">{label}</span>
            </div>
            <ScoreRing value={score} greenness={greenness} />
          </div>

          {/* compact live metrics (mobile — desktop shows the floating dashboard) */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
            {[
              { l: "Solar", v: `${model.solarGeneration}kW`, c: FLOW_COLORS.solar },
              { l: "Battery", v: `${model.batteryPct}%`, c: FLOW_COLORS.stored },
              { l: "Renewable", v: `${model.renewablePct}%`, c: FLOW_COLORS.renewable },
            ].map((m) => (
              <div key={m.l} className="rounded-xl bg-mist p-2 text-center">
                <span className="mx-auto mb-1 block h-1.5 w-1.5 rounded-full" style={{ background: m.c }} />
                <span className="block font-display text-sm font-bold text-navy">{m.v}</span>
                <span className="text-[10px] text-navy/50">{m.l}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-navy/50">
              <span>Grid dependency</span>
              <span className={cn(grid.level === "Very low" || grid.level === "Low" ? "text-elixa-green" : grid.level === "Medium" ? "text-amber-500" : "text-red-500")}>
                {grid.level}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: FLOW_COLORS.grid }}
                animate={{ width: `${Math.max(6, grid.pct)}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>

        {/* combination message */}
        <AnimatePresence mode="wait">
          {combo && (
            <motion.div
              key={combo.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border border-elixa-green/30 bg-elixa-gradient-soft p-4"
            >
              <p className="font-display text-sm font-bold text-navy">✦ {combo.title}</p>
              <p className="mt-1 text-sm text-navy/70">{combo.body}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* technology selector */}
        <div className="rounded-4xl border border-navy/10 bg-white p-5 shadow-card">
          {/* step 1: the floor plan — we need it for the heat-loss calculation anyway */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy/50">1 · Your floor plan</p>
          <label className="mb-2 flex cursor-pointer items-center gap-2.5 rounded-2xl border border-dashed border-navy/25 bg-mist px-3.5 py-2.5 text-sm text-navy/70 transition-colors hover:border-elixa-cyan">
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-elixa-cyan" fill="none" aria-hidden="true">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="flex-1 truncate">{planName ?? "Upload your floor plan — PDF or photo"}</span>
            {planName && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearPlan();
                  setPlanName(null);
                  setPreviewUrl(null);
                  setPlanRead(null);
                  setPlanLayout(null);
                  setPlanDebug(null);
                  setPlanAreaM2(null);
                  savePlanArea(null);
                  setLayoutOn(false);
                  setFloorsData([DEFAULT_GROUND]);
                  setActiveFloorId("ground");
                }}
                className="flex-none font-semibold text-navy/40 hover:text-navy"
                aria-label="Remove floor plan"
              >
                ✕
              </button>
            )}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                if (f.size > 10 * 1024 * 1024) {
                  alert("That file is over 10 MB — please choose a smaller file or a photo.");
                  return;
                }
                savePlan(f);
                setPlanName(f.name);
                track("cta_click", { location: "smart-energy-home", label: "plan-upload" });
                // rasterise it live so the plan appears inside the 3D scene
                makePlanPreview(f).then((blob) => {
                  if (blob) {
                    savePlanPreview(blob);
                    setPreviewUrl(blob);
                    // extract the wall layout so it can be extruded into 3D
                    extractLayout(blob, { debug: debugOn.current }).then(acceptLayout);
                    // hosted recognition (when configured) runs in parallel and
                    // upgrades the layout when its structured result lands; any
                    // failure leaves the in-browser extraction in place
                    if (planApiConfigured()) {
                      recognisePlan(blob).then(async (raw) => {
                        if (!raw) return;
                        try {
                          const bmp = await createImageBitmap(blob);
                          const api = adaptRecognition(raw, bmp.width, bmp.height);
                          bmp.close();
                          if (api?.ok) acceptLayout(api);
                        } catch (e) {
                          console.warn("[elixa] plan api adapt failed", e);
                        }
                      });
                    }
                  }
                });
                // read the plan's text and shape the house to match
                analysePlan(f).then((a) => {
                  if (a) {
                    savePlanAnalysis(a);
                    applyAnalysis(a);
                  }
                });
              }}
            />
          </label>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-navy/45">Upload applies to</span>
            {floorsData.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFloorId(f.id)}
                aria-pressed={activeFloorId === f.id}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  activeFloorId === f.id ? "bg-navy text-white" : "bg-white/70 text-navy/55 hover:text-navy"
                )}
              >
                {f.name}
                {f.layout?.ok ? " ✓" : ""}
              </button>
            ))}
            {floorsData.length < 4 && (
              <button
                type="button"
                onClick={() => {
                  setFloorsData((fs) => {
                    const level = Math.max(...fs.map((f) => f.level)) + 1;
                    const rec: FloorRec = {
                      id: `floor-${level}`,
                      name: FLOOR_NAMES[level] ?? `Floor ${level}`,
                      level,
                      ceilingHeight: DEFAULT_CEILING_HEIGHT,
                      layout: null,
                    };
                    const next = [...fs, rec];
                    saveFloors(next);
                    setActiveFloorId(rec.id);
                    return next;
                  });
                }}
                className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-navy/55 transition hover:text-navy"
              >
                + Add floor
              </button>
            )}
          </div>

          <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-navy/20 bg-white/60 px-3.5 py-2.5 text-xs text-navy/70 transition hover:border-navy/40">
            <span className="text-base">🧊</span>
            <span className="flex-1 truncate">
              {showcaseUrl ? "3D model loaded — shown as the ✨ Showcase view" : "Have a 3D model of your home? Upload it (.glb)"}
            </span>
            {showcaseUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  saveShowcaseModel(null);
                  setShowcaseUrl(null);
                }}
                className="flex-none font-semibold text-navy/40 hover:text-navy"
                aria-label="Remove 3D model"
              >
                ✕
              </button>
            )}
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (!f) return;
                if (f.size > 200 * 1024 * 1024) {
                  alert("That model is over 200 MB — please export a smaller GLB.");
                  return;
                }
                saveShowcaseModel(f);
                setShowcaseUrl(URL.createObjectURL(f));
                setLayoutOn(true);
                track("cta_click", { location: "smart-energy-home", label: "model-upload" });
              }}
            />
          </label>

          {planRead && (planRead.bedrooms || planRead.rooms.length > 0) ? (
            <div className="mb-4 rounded-2xl border border-elixa-green/30 bg-elixa-gradient-soft px-3.5 py-2.5">
              <p className="text-xs font-bold text-navy">✓ Read from your plan — the 3D home has been set to match:</p>
              <p className="mt-1 text-xs text-navy/70">
                {[
                  planRead.bedrooms ? `${planRead.bedrooms} bedrooms` : null,
                  planRead.storeys ? (planRead.storeys === 2 ? "two-storey" : "bungalow") : null,
                  ...planRead.rooms.slice(0, 5),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                {planRead.rooms.length > 5 ? " …" : ""}
              </p>
            </div>
          ) : (
            <p className="mb-4 text-xs text-navy/45">
              {planName
                ? "✓ Saved — it will be attached to your quote for your heat-loss calculation."
                : "We use it for your heat-loss calculation, and it travels with your quote automatically."}
            </p>
          )}

          {planLayout?.ok && (
            <>
              <button
                onClick={() => {
                  setLayoutOn((v) => !v);
                  track("cta_click", { location: "smart-energy-home", label: "apply-layout" });
                }}
                className={layoutOn ? "btn-outline btn-md mb-4 w-full" : "btn-primary btn-md mb-4 w-full"}
              >
                {layoutOn ? "⌂ Back to the smart home view" : "🏗 Apply my exact layout to the 3D house"}
              </button>
              <label className="mb-4 flex items-center gap-2 text-xs text-navy/60">
                <span className="flex-1">
                  Total floor area from your plan (m²)
                  {planLayout.scale ? " — walls are now true to scale" : " — sets true wall heights"}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={20}
                  max={2000}
                  step="0.1"
                  value={planAreaM2 ?? ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    const n = isFinite(v) ? v : null;
                    setPlanAreaM2(n);
                    savePlanArea(n);
                  }}
                  placeholder="e.g. 134.6"
                  className="w-24 rounded-xl border border-navy/20 bg-white px-2.5 py-1.5 text-right text-sm font-semibold text-navy outline-none focus:border-elixa-cyan"
                />
              </label>
            </>
          )}

          {/* step 2: confirm the shape — the 3D house and energy figures follow */}
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy/50">2 · Confirm your home</p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-navy/15 p-0.5">
              {([2, 3, 4, 5] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setHome((h) => ({ ...h, bedrooms: b }))}
                  aria-pressed={home.bedrooms === b}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    home.bedrooms === b ? "bg-navy text-white" : "text-navy/60"
                  )}
                >
                  {b} bed
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-navy/15 p-0.5">
              {([2, 1] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setHome((h) => ({ ...h, storeys: s }))}
                  aria-pressed={home.storeys === s}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    home.storeys === s ? "bg-navy text-white" : "text-navy/60"
                  )}
                >
                  {s === 2 ? "Two-storey" : "Bungalow"}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-navy/50">3 · Build your smarter home</p>
          <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
            {TECHS.map((t) => {
              const on = selected.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  aria-pressed={on}
                  className={cn(
                    "flex min-w-[150px] items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition-all md:min-w-0",
                    on
                      ? "border-transparent bg-elixa-gradient text-white shadow-glow"
                      : "border-navy/15 text-navy/70 hover:border-elixa-cyan"
                  )}
                >
                  <ServiceIcon name={t.icon} className="h-5 w-5 flex-none" />
                  <span className="flex-1">{t.short}</span>
                  <span
                    className={cn(
                      "grid h-5 w-5 flex-none place-items-center rounded-full border text-[10px]",
                      on ? "border-white bg-white/20" : "border-navy/25"
                    )}
                  >
                    {on ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          {selected.has("aircon") && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-navy/50">AC mode</span>
              <div className="inline-flex rounded-full border border-navy/15 p-0.5">
                {(["cool", "heat"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAcMode(m)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      acMode === m ? (m === "cool" ? "bg-elixa-cyan text-white" : "bg-[#f2683c] text-white") : "text-navy/60"
                    )}
                  >
                    {m === "cool" ? "❄ Cooling" : "🔥 Heating"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={buildComplete} className="btn-primary btn-md mt-4 w-full">
            ⚡ Build the complete Elixa home
          </button>
        </div>

        {/* summary → quote */}
        <div className="rounded-4xl bg-navy-900 p-5 text-white shadow-elevated">
          <p className="text-xs font-bold uppercase tracking-wide text-elixa-green">Your smart home</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {active.length === 0 && <li className="text-sm text-white/50">Add technologies to build your system…</li>}
            {active.map((t) => (
              <li key={t} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                <ServiceIcon name={techById(t).icon} className="h-3.5 w-3.5" />
                {techById(t).short}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/70">Want to know what this could look like for your home?</p>
          <div className="mt-3 flex flex-col gap-2">
            <Link href={quoteHref} onClick={() => track("cta_click", { location: "smart-energy-home", label: "assessment" })} className="btn-primary btn-md w-full">
              Get my free home assessment
            </Link>
            <a href={site.phoneHref} onClick={() => track("phone_click", { location: "smart-energy-home" })} className="btn-outline btn-md w-full !border-white/20 !bg-white/5 !text-white">
              Speak to a specialist · {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {planDebug && <PlanDebugPanel debug={planDebug} planUrl={planUrl} />}
    </div>
  );
}

/* -------- score ring -------- */
function ScoreRing({ value, greenness }: { value: number; greenness: number }) {
  const R = 26;
  const C = 2 * Math.PI * R;
  const off = C - (value / 100) * C;
  const col = greenness > 0.6 ? "#6ABF4B" : greenness > 0.3 ? "#35b1ab" : "#1D9ED9";
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="flex-none">
      <circle cx="34" cy="34" r={R} fill="none" stroke="#e6edf5" strokeWidth="7" />
      <motion.circle
        cx="34"
        cy="34"
        r={R}
        fill="none"
        stroke={col}
        strokeWidth="7"
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
        strokeDasharray={C}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <text x="34" y="39" textAnchor="middle" fontSize="17" fontWeight="800" fill="#12294f" fontFamily="sans-serif">
        {value}
      </text>
    </svg>
  );
}

/* -------- live dashboard -------- */
function Dashboard({ model, isDay }: { model: ReturnType<typeof computeEnergy>; isDay: boolean }) {
  const items = [
    { label: "Solar", value: `${model.solarGeneration}`, unit: "kW", c: FLOW_COLORS.solar },
    { label: "Home demand", value: `${model.homeDemand}`, unit: "kW", c: "#8aa0bd" },
    { label: "Battery", value: `${model.batteryPct}`, unit: "%", c: FLOW_COLORS.stored },
    { label: "Grid import", value: `${model.gridImport}`, unit: "kW", c: FLOW_COLORS.grid },
    { label: "Renewable use", value: `${model.renewablePct}`, unit: "%", c: FLOW_COLORS.renewable },
  ];
  return (
    <div className="pointer-events-none absolute right-3 top-3 hidden w-[150px] rounded-2xl bg-white/85 p-3 backdrop-blur sm:right-4 sm:top-4 sm:block">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-navy/45">Illustrative live flows</p>
      <div className="grid gap-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] text-navy/60">
              <span className="h-2 w-2 rounded-full" style={{ background: it.c }} />
              {it.label}
            </span>
            <motion.span key={it.value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-display text-xs font-bold text-navy">
              {it.value}
              <span className="text-navy/40"> {it.unit}</span>
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowLegend() {
  const items = [
    { c: FLOW_COLORS.solar, l: "Solar" },
    { c: FLOW_COLORS.renewable, l: "Renewable" },
    { c: FLOW_COLORS.stored, l: "Stored" },
    { c: FLOW_COLORS.heat, l: "Heat" },
    { c: FLOW_COLORS.cool, l: "Cool" },
    { c: FLOW_COLORS.grid, l: "Grid" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex max-w-[70%] flex-wrap gap-1.5">
      {items.map((it) => (
        <span key={it.l} className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-navy/70 backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ background: it.c }} />
          {it.l}
        </span>
      ))}
    </div>
  );
}

/* -------- equipment info bottom sheet -------- */
function EquipmentSheet({
  picked,
  selected,
  onToggle,
  onClose,
}: {
  picked: TechId | "grid";
  selected: Set<TechId>;
  onToggle: (id: TechId) => void;
  onClose: () => void;
}) {
  if (picked === "grid") {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="absolute inset-x-3 bottom-3 rounded-3xl border border-navy/10 bg-white/95 p-5 shadow-floating backdrop-blur"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-navy/40 hover:text-navy">✕</button>
        <h4 className="font-display text-lg font-bold text-navy">Grid connection</h4>
        <p className="mt-1 text-sm text-navy/70">
          Your home stays connected to the grid for whatever your own system doesn&apos;t supply. Add solar and battery to draw less from it.
        </p>
      </motion.div>
    );
  }
  const t = techById(picked);
  const on = selected.has(picked);
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 260 }}
      className="absolute inset-x-3 bottom-3 rounded-3xl border border-navy/10 bg-white/95 p-5 shadow-floating backdrop-blur"
    >
      <button onClick={onClose} className="absolute right-4 top-4 text-navy/40 hover:text-navy">✕</button>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-elixa-gradient-soft text-navy">
          <ServiceIcon name={t.icon} className="h-6 w-6" />
        </span>
        <h4 className="font-display text-lg font-bold text-navy">{t.label}</h4>
      </div>
      <p className="mt-2 text-sm text-navy/70">{t.blurb}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onToggle(picked)}
          className={cn("btn-md", on ? "btn-outline" : "btn-primary")}
        >
          {on ? "Remove from my home" : "Add to my home"}
        </button>
        <Link href={t.slug} className="btn-outline btn-md">Learn more</Link>
        <Link href={`/quote?tech=${TECH_TO_SERVICE_SLUG[picked]}`} className="btn-navy btn-md">Get a quote</Link>
      </div>
    </motion.div>
  );
}

/* -------- build-complete finale -------- */
function Finale({ quoteHref, onClose }: { quoteHref: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 grid place-items-center bg-navy-900/80 p-6 text-center backdrop-blur-sm"
    >
      <motion.div initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ ease: [0.22, 1, 0.36, 1] }}>
        <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">One home.</p>
        <p className="text-gradient font-display text-2xl font-extrabold sm:text-3xl">One connected energy ecosystem.</p>
        <p className="mt-2 text-sm text-white/70">Powering a smarter, greener future.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={quoteHref} className="btn-primary btn-lg">Design my energy system</Link>
          <button onClick={onClose} className="btn-ghost btn-lg">Keep exploring</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------- lightweight preview / accessible fallback -------- */
function StagePreview({ can3d, active, isDay }: { can3d: boolean; active: TechId[]; isDay: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center p-6">
      <div className="text-center">
        <svg viewBox="0 0 200 140" className="mx-auto w-56" aria-hidden="true">
          <rect width="200" height="140" fill="transparent" />
          <polygon points="40,70 100,32 160,70" fill={isDay ? "#26467e" : "#16305c"} />
          <rect x="52" y="70" width="96" height="52" fill={isDay ? "#eef3f8" : "#22304d"} stroke="#c4d3e4" />
          {active.includes("solar") && <rect x="62" y="48" width="34" height="16" transform="skewX(-24)" fill="#12244a" stroke="#1D9ED9" />}
          <rect x="88" y="96" width="24" height="26" fill={isDay ? "#cfe0f0" : "#1a2740"} />
        </svg>
        {!can3d ? (
          <p className="mt-3 max-w-xs text-sm text-navy/60">
            Interactive 3D isn&apos;t available on this device, but you can still build your system and see the score, dashboard and grid dependency update on the right.
          </p>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-navy/50">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/20 border-t-elixa-cyan" />
            Loading the interactive home…
          </div>
        )}
      </div>
    </div>
  );
}
