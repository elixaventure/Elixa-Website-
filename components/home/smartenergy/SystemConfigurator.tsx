"use client";

import { useEffect, useState } from "react";
import { HEAT_SOURCES, EMITTERS, CURRENT_SYSTEMS } from "@/content/heatingSystems";
import { calculateSystem, type SystemChoice } from "@/lib/heatingCalc";
import { saveSystem, loadSystem } from "@/lib/planStore";
import { track } from "@/lib/analytics";

/**
 * Choose a heat source and an emitter from the product lists and see the
 * annual running cost, saving and CO₂ for that exact combination. The
 * product data (and every benefit shown) lives in content/heatingSystems.ts.
 */
export function SystemConfigurator({
  areaM2,
  bedrooms,
  onSync,
}: {
  areaM2: number | null;
  bedrooms: number;
  /** lets the 3D scene light up the matching technologies */
  onSync?: (opts: { heatPump: boolean; emitterTech: "thermaskirt" | "underfloor" | null }) => void;
}) {
  const [choice, setChoice] = useState<SystemChoice | null>(null);

  useEffect(() => {
    loadSystem<SystemChoice>().then((s) => s && setChoice(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<SystemChoice>) => {
    setChoice((cur) => {
      const next: SystemChoice = {
        currentId: cur?.currentId ?? CURRENT_SYSTEMS[0].id,
        sourceId: cur?.sourceId ?? "",
        emitterId: cur?.emitterId ?? "",
        ...patch,
      };
      saveSystem(next);
      const source = HEAT_SOURCES.find((s) => s.id === next.sourceId);
      const emitter = EMITTERS.find((e) => e.id === next.emitterId);
      onSync?.({ heatPump: Boolean(source?.isHeatPump), emitterTech: emitter?.techId ?? null });
      if (patch.sourceId || patch.emitterId) {
        track("cta_click", { location: "smart-energy-home", label: `system-${patch.sourceId ?? patch.emitterId}` });
      }
      return next;
    });
  };

  const source = HEAT_SOURCES.find((s) => s.id === choice?.sourceId);
  const emitter = EMITTERS.find((e) => e.id === choice?.emitterId);
  const result =
    choice && source && emitter ? calculateSystem(choice, areaM2, bedrooms) : null;

  const selectCls =
    "w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-navy focus:border-elixa-green focus:outline-none";

  return (
    <div className="mb-4">
      <div className="grid gap-2.5">
        <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-navy/45">
          How you heat your home today
          <select
            className={selectCls}
            value={choice?.currentId ?? CURRENT_SYSTEMS[0].id}
            onChange={(e) => update({ currentId: e.target.value })}
          >
            {CURRENT_SYSTEMS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-navy/45">
          New heat source
          <select
            className={selectCls}
            value={choice?.sourceId ?? ""}
            onChange={(e) => update({ sourceId: e.target.value })}
          >
            <option value="" disabled>
              Choose a heat source…
            </option>
            {HEAT_SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {source && (
          <ProductBenefits blurb={source.blurb} benefits={source.benefits} />
        )}

        <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-wide text-navy/45">
          How the heat gets into your rooms
          <select
            className={selectCls}
            value={choice?.emitterId ?? ""}
            onChange={(e) => update({ emitterId: e.target.value })}
          >
            <option value="" disabled>
              Choose an emitter…
            </option>
            {EMITTERS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — runs at {e.flowTemp}°C
              </option>
            ))}
          </select>
        </label>
        {emitter && (
          <ProductBenefits blurb={emitter.blurb} benefits={emitter.benefits} />
        )}
      </div>

      {result && (
        <div className="mt-3 rounded-2xl border border-elixa-green/30 bg-elixa-gradient-soft p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-navy/50">
            Your system: {result.source.name} + {result.emitter.name}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <Stat label="Estimated running cost" value={`£${result.annualCost.toLocaleString()}/yr`} />
            <Stat
              label={`vs ${result.current.name.toLowerCase()}`}
              value={
                result.savingPerYear >= 0
                  ? `save £${result.savingPerYear.toLocaleString()}/yr`
                  : `+£${Math.abs(result.savingPerYear).toLocaleString()}/yr`
              }
              highlight={result.savingPerYear > 0}
            />
            <Stat
              label="System efficiency"
              value={result.source.isHeatPump ? `${Math.round(result.efficiency * 100)}%` : `${Math.round(result.efficiency * 100)}%`}
            />
            <Stat
              label="CO₂ vs today"
              value={
                result.co2SavedKg >= 0
                  ? `−${(result.co2SavedKg / 1000).toFixed(1)} t/yr`
                  : `+${(-result.co2SavedKg / 1000).toFixed(1)} t/yr`
              }
              highlight={result.co2SavedKg > 0}
            />
          </div>
          {result.source.isHeatPump && (
            <p className="mt-2 text-[11px] leading-snug text-navy/60">
              The {result.emitter.name.toLowerCase()} runs at {result.emitter.flowTemp}°C, so the heat pump
              achieves around {result.emitter.scopWithHeatPump.toFixed(1)} units of heat per unit of
              electricity — the emitter choice is what unlocks this efficiency.
            </p>
          )}
          <p className="mt-2 text-[10px] text-navy/45">
            Illustrative, based on {areaM2 && areaM2 > 20 ? `your plan's ${Math.round(areaM2)} m²` : `a typical ${bedrooms}-bed home`} and
            typical UK prices — confirmed by your free heat-loss survey.
          </p>
        </div>
      )}
    </div>
  );
}

function ProductBenefits({ blurb, benefits }: { blurb: string; benefits: string[] }) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2.5">
      <p className="text-xs leading-snug text-navy/70">{blurb}</p>
      <ul className="mt-1.5 grid gap-1">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-1.5 text-[11px] leading-snug text-navy/70">
            <span className="mt-px flex-none font-bold text-elixa-green">✓</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/45">{label}</p>
      <p className={highlight ? "font-display text-base font-bold text-elixa-green" : "font-display text-base font-bold text-navy"}>
        {value}
      </p>
    </div>
  );
}
