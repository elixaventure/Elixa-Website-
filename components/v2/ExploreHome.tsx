"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * "Explore the Elixa home" — the branded cutaway house as an interactive
 * diagram. Each product is a pulsing hotspot; selecting one glides the scene
 * into that unit and opens an information panel. Figures mirror
 * content/heatingSystems.ts (the editable product lists) so the story the
 * panel tells matches what the configurator calculates.
 */

interface Spot {
  id: string;
  label: string;
  /** pin position, % of image */
  x: number;
  y: number;
  /** zoom applied when active (scene scales around the pin) */
  scale: number;
  title: string;
  blurb: string;
  stats: { k: string; v: string }[];
  href: string;
  /** optional deep-dive content (headed paragraphs) shown below the stats */
  sections?: { h: string; body: string }[];
  /** optional powder-coat finish swatches */
  finishes?: { name: string; ral: string; hex: string; note?: string }[];
}

const SPOTS: Spot[] = [
  {
    id: "solar",
    label: "Solar PV",
    x: 37.5,
    y: 24.5,
    scale: 2.0,
    title: "Solar PV",
    blurb:
      "Generation designed around your roof — string layout per aspect, not a one-size array bolted on. Export-ready, and the natural partner for a heat pump and battery.",
    stats: [
      { k: "Design", v: "Per-roof string layout" },
      { k: "Pairs with", v: "Battery · heat pump · EV" },
      { k: "VAT", v: "0% on qualifying installs to 2027" },
    ],
    href: "/solar-pv",
  },
  {
    id: "battery",
    label: "Battery storage",
    x: 28,
    y: 46,
    scale: 2.2,
    title: "Battery Storage",
    blurb:
      "Holds your solar generation — or cheap off-peak electricity — until the house actually needs it, so less of your power is bought at peak price.",
    stats: [
      { k: "Coupling", v: "AC or DC coupled" },
      { k: "Works with", v: "Smart time-of-use tariffs" },
      { k: "Sizing", v: "Matched to your evening load" },
    ],
    href: "/battery-storage",
  },
  {
    id: "heatpump",
    label: "Heat pump",
    x: 20,
    y: 58.5,
    scale: 2.2,
    title: "Air Source Heat Pump",
    blurb:
      "Draws free heat from the outside air — several units of heat for every unit of electricity. Efficiency depends on the emitters it feeds, which is why we design the whole system together.",
    stats: [
      { k: "Output", v: "3–4 kWh heat per kWh in" },
      { k: "SCOP", v: "≈ 4.0 with 40 °C emitters" },
      { k: "Grant", v: "£7,500 Boiler Upgrade Scheme" },
    ],
    href: "/air-source-heat-pumps",
  },
  {
    id: "ev",
    label: "EV charging",
    x: 16,
    y: 72,
    scale: 2.2,
    title: "EV Charging",
    blurb:
      "A 7.4 kW home charger that can prioritise your own solar generation — charge from the roof first, the grid second.",
    stats: [
      { k: "Power", v: "7.4 kW" },
      { k: "Mode", v: "Solar-aware charging" },
      { k: "Control", v: "Scheduled off-peak charging" },
    ],
    href: "/ev-charging",
  },
  {
    id: "aircon",
    label: "Air conditioning",
    x: 73.5,
    y: 34.5,
    scale: 2.0,
    title: "Air Conditioning",
    blurb:
      "Discreet wall units for cooling in summer — and because they are heat pumps too, highly efficient warmth for single rooms in winter.",
    stats: [
      { k: "Role", v: "Cooling + room heating" },
      { k: "Type", v: "Air-to-air heat pump" },
      { k: "Control", v: "Per-room, app controlled" },
    ],
    href: "/air-conditioning",
  },
  {
    id: "underfloor",
    label: "Underfloor heating",
    x: 70.5,
    y: 58.5,
    scale: 2.1,
    title: "Underfloor Heating",
    blurb:
      "Warm water pipework across the whole floor — completely invisible, gentle and even. The lowest flow temperature of any emitter, so a heat pump feeding it works at its best.",
    stats: [
      { k: "Flow temp", v: "35 °C — lowest of any emitter" },
      { k: "Heat pump SCOP", v: "≈ 4.2" },
      { k: "Zoning", v: "Room-by-room manifolds" },
    ],
    href: "/underfloor-heating",
  },
  {
    id: "thermaskirt",
    label: "ThermaSkirt",
    x: 76.5,
    y: 74,
    scale: 2.1,
    title: "ThermaSkirt Heated Skirting",
    blurb:
      "The skirting board becomes the radiator — a discreet aluminium perimeter emitter around every room that frees the walls and retrofits with far less disruption than underfloor.",
    stats: [
      { k: "Flow temp", v: "40 °C — heat-pump ready" },
      { k: "Heat pump SCOP", v: "≈ 4.0" },
      { k: "Output (Deco 114/170 mm)", v: "up to ≈126 / ≈188 W per metre" },
      { k: "Lengths", v: "2 m · 3 m · 6 m, cut on site" },
    ],
    // Manufacturer figures: DiscreteHeat Co. Ltd (discreteheat.com) product &
    // performance data. Outputs to EN 442 (75/65/20); heat-pump figures at
    // 45/40 flow. Refined per room by the heat-loss survey before quoting.
    sections: [
      {
        h: "Styles & sizes",
        body: "Deco is the modern flat profile in two heights — 114 mm and 170 mm, both just 20 mm deep — with plain, torus or ovolo top-cap options. The Classic TS profile keeps the traditional bull-nose look, made for Victorian and Edwardian homes where period skirting has to stay period.",
      },
      {
        h: "ThermaSkirt-e (electric)",
        body: "The same boards with a self-regulating electric element inside instead of pipework — it caps itself at around 95 °C, runs from a standard fused spur, and each room gets its own digital thermostat. Ideal for extensions, lofts and homes without a wet system.",
      },
      {
        h: "Fitted as a system",
        body: "Boards click onto concealed brackets with internal and external corners, valves and fittings supplied — a whole room is typically converted in hours, with no walls opened and no floors lifted.",
      },
    ],
    finishes: [
      { name: "Cricket White", ral: "RAL 9010", hex: "#F1EDE1" },
      { name: "Vintage Ivory", ral: "RAL 1013", hex: "#E6DCC4" },
      { name: "Anthracite Grey", ral: "RAL 7016", hex: "#383E42" },
      { name: "Carbon Black", ral: "RAL 9011", hex: "#26282B" },
      { name: "Any RAL colour", ral: "to order", hex: "#3EC5B4", note: "made to order" },
    ],
    href: "/thermaskirt",
  },
];

export function ExploreHome() {
  const [active, setActive] = useState<Spot | null>(null);
  const [reduced, setReduced] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Desktop zoom drives background-size/position rather than a scaled layer —
  // paints reliably everywhere and can never pull an image edge into view.
  // Position maps the pin to the focal point (left of the side panel):
  // pos% = (focal − pin·scale) / (1 − scale), clamped to the image bounds.
  const zoomed = Boolean(active && !reduced && desktop);
  const bgPos = (pin: number, focal: number, s: number) =>
    Math.min(100, Math.max(0, ((focal - (pin / 100) * s) / (1 - s)) * 100));
  const zoom = zoomed
    ? {
        backgroundSize: `${active!.scale * 100}%`,
        backgroundPosition: `${bgPos(active!.x, 0.36, active!.scale)}% ${bgPos(active!.y, 0.46, active!.scale)}%`,
      }
    : { backgroundSize: "100%", backgroundPosition: "50% 50%" };

  return (
    <section id="solutions" className="relative border-t border-night-line bg-night">
      <div className="mx-auto max-w-[1500px] px-5 pb-8 pt-20 md:px-10 md:pt-28">
        <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">Solutions</p>
        <h2 className="v2-narrow mt-3 max-w-[18ch] font-arch text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-night-text md:text-6xl">
          One home. Every system.
        </h2>
        <p className="mt-4 max-w-[56ch] text-night-muted">
          Select a system to look closer — how it works, how efficient it is and what it pairs with.
          Every figure is refined by a free heat-loss survey before anything is quoted.
        </p>
      </div>

      <div className="mx-auto max-w-[1500px] md:px-10">
        <div
          ref={frame}
          className="relative overflow-hidden border-y border-night-line bg-night-deep md:border"
        >
          {/* the scene — zoom animates the background, never a scaled layer */}
          <motion.div
            role="img"
            aria-label="Cutaway illustration of a home fitted with Elixa systems: solar PV, battery storage, an air source heat pump, EV charging, air conditioning, underfloor heating and ThermaSkirt heated skirting"
            animate={zoom}
            transition={{ type: "tween", duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => active && setActive(null)}
            className={`relative aspect-[3/2] w-full bg-no-repeat ${active ? "cursor-zoom-out" : ""}`}
            style={{ backgroundImage: `url(${BASE}/media/elixa-home.jpg)` }}
          >
            {/* hotspots — fade away while the scene is zoomed in */}
            <motion.div
              animate={{ opacity: zoomed ? 0 : 1 }}
              transition={{ duration: 0.35 }}
              className={zoomed ? "pointer-events-none" : ""}
            >
              {SPOTS.map((s) => {
                const on = active?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActive(on ? null : s);
                    }}
                    aria-label={`${s.label} — view details`}
                    aria-expanded={on}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  >
                    <span className="relative flex h-9 w-9 items-center justify-center md:h-11 md:w-11">
                      {!on && !reduced && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-night-accent/25" />
                      )}
                      <span
                        className={`relative flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300 md:h-6 md:w-6 ${
                          on
                            ? "border-night-accent bg-night-accent"
                            : "border-night-accent/80 bg-night/70 backdrop-blur-sm group-hover:bg-night-accent/30"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-night" : "bg-night-accent"}`} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>

          {/* info panel — side sheet on desktop, bottom sheet on mobile */}
          <AnimatePresence>
            {active && (
              <motion.aside
                key={active.id}
                initial={reduced ? { opacity: 0 } : desktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 20 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
                exit={reduced ? { opacity: 0 } : desktop ? { opacity: 0, x: 48 } : { opacity: 0, y: 20 }}
                transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 border-t border-night-line bg-night p-6 md:absolute md:inset-y-0 md:right-0 md:w-[400px] md:overflow-y-auto md:border-l md:border-t-0 md:bg-night/95 md:p-8 md:backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-techmono text-[10px] uppercase tracking-[0.24em] text-night-accent">
                      {active.label}
                    </p>
                    <h3 className="mt-2 font-arch text-2xl font-semibold tracking-[-0.01em] text-night-text md:text-3xl">
                      {active.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActive(null)}
                    aria-label="Close"
                    className="mt-1 flex h-8 w-8 flex-none items-center justify-center border border-night-line font-techmono text-xs text-night-muted transition-colors hover:border-night-text/40 hover:text-night-text"
                  >
                    ✕
                  </button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-night-muted">{active.blurb}</p>

                <dl className="mt-6 divide-y divide-night-line border-y border-night-line">
                  {active.stats.map((st) => (
                    <div key={st.k} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint">
                        {st.k}
                      </dt>
                      <dd className="text-right text-sm font-medium text-night-text">{st.v}</dd>
                    </div>
                  ))}
                </dl>

                {active.sections?.map((sec) => (
                  <div key={sec.h} className="mt-6">
                    <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                      {sec.h}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-night-muted">{sec.body}</p>
                  </div>
                ))}

                {active.finishes && (
                  <div className="mt-6">
                    <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                      Finishes
                    </p>
                    <ul className="mt-3 grid gap-2.5">
                      {active.finishes.map((f) => (
                        <li key={f.name} className="flex items-center gap-3">
                          <span
                            className="h-6 w-10 flex-none rounded-[3px] border border-night-line"
                            style={
                              f.note
                                ? {
                                    background:
                                      "linear-gradient(90deg,#c0392b,#e67e22,#f1c40f,#27ae60,#2980b9,#8e44ad)",
                                  }
                                : { backgroundColor: f.hex }
                            }
                          />
                          <span className="text-sm text-night-text">{f.name}</span>
                          <span className="ml-auto font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">
                            {f.ral}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs leading-relaxed text-night-faint">
                      Tough double epoxy powder coat. Swatch colours indicative — samples available
                      with your survey.
                    </p>
                  </div>
                )}

                <div className="mt-7 grid gap-3">
                  <Link
                    href={active.href}
                    className="group inline-flex items-center justify-between border border-night-accent px-5 py-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
                  >
                    Explore {active.label}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/quote"
                    className="inline-flex items-center justify-between border border-night-text/25 px-5 py-3 font-techmono text-[11px] uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
                  >
                    Request a Survey
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-wrap gap-x-6 gap-y-2 px-5 pb-16 pt-5 md:px-10 md:pb-24">
        {SPOTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className={`font-techmono text-[10px] uppercase tracking-[0.16em] transition-colors ${
              active?.id === s.id ? "text-night-accent" : "text-night-faint hover:text-night-muted"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
}
