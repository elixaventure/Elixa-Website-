"use client";

import { motion } from "framer-motion";

const money = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export interface Bar {
  label: string;
  from: number;
  to: number;
  /** The accent bar is what the customer pays; the rest is context. */
  lead?: boolean;
  /** Shown instead of a figure, for a row that is deliberately not a price. */
  note?: string;
}

/**
 * The price, as a shape rather than a sentence.
 *
 * Two numbers in a paragraph take a moment to compare. Two bars do not:
 * the grant is the length that disappears between them, and the width of
 * a bar is the spread between the low and high ends of the estimate, so
 * an honest range reads as an honest range rather than as vagueness.
 *
 * Every bar is drawn on one scale — the largest figure on the chart — so
 * the lengths mean something against each other. Drawing each to its own
 * maximum would make a £3,000 bar and a £14,000 bar the same length,
 * which is worse than showing no chart at all.
 *
 * Each runs from zero, so length is amount and the sum is visible: the
 * grant bar and the what-you-pay bar together come to the length of the
 * before-the-grant bar, and nobody has to be told that. The first attempt
 * drew the range where it sat on the scale, which is more precise and much
 * worse — a £5,500–£6,500 estimate became a small pill floating in the
 * middle of an empty track, reading as nothing at all.
 *
 * The spread between the low and high ends is the lighter tail on the end
 * of the bar, so an estimate looks like an estimate.
 *
 * It animates on change, because the numbers change when somebody goes
 * back and alters an answer, and a figure that visibly moves is one the
 * visitor can see is responding to them.
 */
export function PriceBar({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.to));

  return (
    <div className="mt-7 grid gap-4">
      {bars.map((b) => {
        const solid = (b.from / max) * 100;
        const tail = Math.max(((b.to - b.from) / max) * 100, 0);
        return (
          <div key={b.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span
                className={`font-techmono text-[10px] uppercase tracking-[0.18em] ${
                  b.lead ? "text-night-accent" : "text-night-faint"
                }`}
              >
                {b.label}
              </span>
              <span
                className={`font-techmono text-[13px] tabular-nums ${
                  b.lead ? "text-night-text" : "text-night-muted"
                }`}
              >
                {b.note ?? (b.from === b.to ? money(b.from) : `${money(b.from)} – ${money(b.to)}`)}
              </span>
            </div>
            <div
              className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-night-surface"
              role="presentation"
            >
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  b.lead ? "bg-night-accent" : "bg-night-text/25"
                }`}
                initial={false}
                animate={{ width: `${solid}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* the rest of the range, lighter — this is an estimate and
                  it should look like one */}
              <motion.div
                className={`absolute inset-y-0 rounded-full ${
                  b.lead ? "bg-night-accent/40" : "bg-night-text/10"
                }`}
                initial={false}
                animate={{ left: `${solid}%`, width: `${tail}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
