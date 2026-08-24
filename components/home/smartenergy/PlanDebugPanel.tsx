"use client";

/**
 * TEMPORARY diagnostic panel for the floor-plan wall extractor.
 *
 * Only rendered when the page is loaded with `?planDebug=1`. Customers never
 * see it and it costs nothing when the flag is absent, because
 * `extractLayout` is not asked to record anything in that case.
 *
 * To remove: delete this file and the `planDebug` block in SmartEnergyHome.
 */

import { useEffect, useRef } from "react";
import type { PlanDebug, DebugStage } from "@/lib/planLayoutDebug";

function StageCanvas({ stage }: { stage: DebugStage }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = stage.w;
    cv.height = stage.h;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(new ImageData(stage.rgba, stage.w, stage.h), 0, 0);
  }, [stage]);
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 text-[11px] font-bold uppercase tracking-wide text-navy/70">
        {stage.label}
      </figcaption>
      <canvas
        ref={ref}
        className="w-full rounded-lg border border-navy/15 bg-white"
        style={{ imageRendering: "pixelated" }}
      />
      {stage.note && <p className="mt-1 text-[10px] leading-snug text-navy/50">{stage.note}</p>}
    </figure>
  );
}

const ROWS: { label: string; keys: string[]; derive?: (c: Record<string, number>) => string }[] = [
  { label: "Ink pixels", keys: ["inkPx"] },
  {
    label: "…of which design markup",
    keys: ["markupCountedAsInkPx", "inkPx"],
    derive: (c) =>
      `${c.markupCountedAsInkPx ?? 0} (${(((c.markupCountedAsInkPx ?? 0) / (c.inkPx || 1)) * 100).toFixed(1)}%)`,
  },
  { label: "Markup red / blue / green", keys: [], derive: (c) => `${c.markupRedPx ?? 0} / ${c.markupBluePx ?? 0} / ${c.markupGreenPx ?? 0}` },
  { label: "Thresholds minRun / minStub / gapMax", keys: [], derive: (c) => `${c.minRun}px / ${c.minStub}px / ${c.gapMax}px` },
  { label: "Wall px from long-run band", keys: ["wallPxFromBand"] },
  {
    label: "Wall px from parallel-pair fill",
    keys: ["wallPxFromPairFill"],
    derive: (c) => {
      const t = (c.wallPxFromBand ?? 0) + (c.wallPxFromPairFill ?? 0);
      return `${c.wallPxFromPairFill ?? 0} (${(((c.wallPxFromPairFill ?? 0) / (t || 1)) * 100).toFixed(1)}% of all wall px)`;
    },
  },
  { label: "Grid components", keys: ["components"] },
  {
    label: "Rejected speck / blob / isolated",
    keys: [],
    derive: (c) => `${c.rejectedSpeck ?? 0} / ${c.rejectedBlob ?? 0} / ${c.rejectedIsolated ?? 0}`,
  },
  {
    label: "FINAL BOXES",
    keys: ["boxes"],
    derive: (c) => `${c.boxes} (${c.boxesOneCellTall} are one cell tall)`,
  },
];

export function PlanDebugPanel({ debug, planUrl }: { debug: PlanDebug; planUrl?: string | null }) {
  const c = debug.counts;
  return (
    <section className="mt-6 rounded-3xl border-2 border-dashed border-amber-500/60 bg-amber-50/40 p-4">
      <header className="mb-3 flex flex-wrap items-baseline gap-x-3">
        <h3 className="font-display text-base font-bold text-navy">Extraction diagnostics</h3>
        <p className="text-[11px] text-navy/50">
          ?planDebug=1 · source {debug.srcW}×{debug.srcH} · not visible to customers
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {planUrl && (
          <figure className="min-w-0">
            <figcaption className="mb-1 text-[11px] font-bold uppercase tracking-wide text-navy/70">
              0 · SOURCE
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={planUrl} alt="uploaded plan" className="w-full rounded-lg border border-navy/15 bg-white" />
          </figure>
        )}
        {debug.stages.map((s) => (
          <StageCanvas key={s.key} stage={s} />
        ))}
      </div>

      <table className="mt-4 w-full max-w-xl text-left text-xs">
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label} className="border-b border-navy/10 last:border-0">
              <th className="py-1 pr-4 font-medium text-navy/60">{r.label}</th>
              <td className="py-1 font-mono font-semibold text-navy">
                {r.derive ? r.derive(c) : (c[r.keys[0]] ?? 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
