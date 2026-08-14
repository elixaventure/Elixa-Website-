"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Counter } from "@/components/ui/Counter";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

type PropertyType = "Flat" | "Terraced" | "Semi-detached" | "Detached" | "Commercial";
type Size = "Small" | "Medium" | "Large";
type Heating = "Gas boiler" | "Oil boiler" | "Electric" | "Heat pump" | "Other";

const interests = [
  { key: "solar", label: "Solar PV" },
  { key: "battery", label: "Battery" },
  { key: "heatpump", label: "Heat pump" },
  { key: "aircon", label: "Air conditioning" },
  { key: "ev", label: "EV charging" },
] as const;

/**
 * Indicative-only savings estimator. Produces a rough, clearly-labelled range to
 * start a conversation — never presented as guaranteed. Feeds the lead journey.
 */
export function SavingsCalculator({ compact = false }: { compact?: boolean }) {
  const [property, setProperty] = useState<PropertyType>("Semi-detached");
  const [size, setSize] = useState<Size>("Medium");
  const [heating, setHeating] = useState<Heating>("Gas boiler");
  const [spend, setSpend] = useState(2200);
  const [picked, setPicked] = useState<string[]>(["solar", "battery"]);
  const [done, setDone] = useState(false);

  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const estimate = useMemo(() => {
    const sizeFactor = size === "Small" ? 0.7 : size === "Large" ? 1.35 : 1;
    const propFactor =
      property === "Detached" || property === "Commercial"
        ? 1.3
        : property === "Flat"
        ? 0.7
        : 1;
    let pct = 0;
    if (picked.includes("solar")) pct += 0.18;
    if (picked.includes("battery")) pct += 0.08;
    if (picked.includes("heatpump")) pct += heating === "Gas boiler" ? 0.14 : 0.2;
    if (picked.includes("aircon")) pct += 0.04;
    if (picked.includes("ev")) pct += 0.05;
    pct = Math.min(pct, 0.6);
    const base = spend * sizeFactor * propFactor;
    const annual = Math.round((base * pct) / 10) * 10;
    return {
      low: Math.max(0, Math.round((annual * 0.75) / 10) * 10),
      high: Math.round((annual * 1.15) / 10) * 10,
      co2: Math.round((annual / 1000) * 0.9 * 10) / 10,
    };
  }, [property, size, heating, spend, picked]);

  return (
    <div className={cn("grid gap-6", compact ? "" : "lg:grid-cols-[1.1fr_0.9fr]")}>
      {/* Inputs */}
      <div className="rounded-4xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
        <Field label="Property type">
          <Segmented
            options={["Flat", "Terraced", "Semi-detached", "Detached", "Commercial"]}
            value={property}
            onChange={(v) => setProperty(v as PropertyType)}
          />
        </Field>
        <Field label="Property size">
          <Segmented options={["Small", "Medium", "Large"]} value={size} onChange={(v) => setSize(v as Size)} />
        </Field>
        <Field label="Current heating">
          <Segmented
            options={["Gas boiler", "Oil boiler", "Electric", "Heat pump", "Other"]}
            value={heating}
            onChange={(v) => setHeating(v as Heating)}
          />
        </Field>
        <Field label={`Approx. annual energy spend: £${spend.toLocaleString("en-GB")}`}>
          <input
            type="range"
            min={600}
            max={8000}
            step={100}
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="w-full accent-elixa-cyan"
            aria-label="Approximate annual energy spend"
          />
        </Field>
        <Field label="I'm interested in">
          <div className="flex flex-wrap gap-2">
            {interests.map((it) => (
              <button
                key={it.key}
                onClick={() => toggle(it.key)}
                aria-pressed={picked.includes(it.key)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all",
                  picked.includes(it.key)
                    ? "border-transparent bg-elixa-gradient text-white shadow-glow"
                    : "border-navy/15 text-navy/70 hover:border-elixa-cyan"
                )}
              >
                {it.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* Result */}
      <div className="flex flex-col justify-between rounded-4xl bg-navy-900 p-6 text-white shadow-elevated sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-elixa-green">
            Indicative annual saving
          </p>
          <p className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
            <Counter to={estimate.low} prefix="£" />
            <span className="text-white/40"> – </span>
            <Counter to={estimate.high} prefix="£" />
          </p>
          <p className="mt-3 text-sm text-white/60">
            Plus roughly <strong className="text-white">{estimate.co2}t</strong> less CO₂ a year,
            based on your selections.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-elixa-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (estimate.high / (spend || 1)) * 100)}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/quote?intent=assessment"
            onClick={() => {
              setDone(true);
              track("calculator_complete", { spend, interests: picked.join(",") });
            }}
            className="btn-primary btn-lg w-full"
          >
            Get a Personalised Assessment
          </Link>
          <p className="mt-3 text-center text-xs text-white/40">
            Estimates are indicative only and not guaranteed. Your actual savings depend on your
            property, usage, tariff and system design.
          </p>
          {done && (
            <p className="mt-2 text-center text-xs text-elixa-green">Great — let&apos;s tailor it to you.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="mb-2 block font-display text-sm font-semibold text-navy">{label}</label>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
            value === o
              ? "border-navy bg-navy text-white"
              : "border-navy/15 text-navy/70 hover:border-navy/40"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
