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
  /** common questions for this trade, rendered as expandable rows */
  faqs?: { q: string; a: string }[];
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
      { k: "Panels", v: "≈ 400–450 W per modern panel" },
      { k: "Export", v: "Smart Export Guarantee ready" },
      { k: "VAT", v: "0% on qualifying installs to 2027" },
    ],
    sections: [
      {
        h: "What we do",
        body: "Roof survey and shading assessment, then a string design per roof aspect so every panel earns its place. We handle the DNO notification, set up export metering, and pair the array with your battery, heat pump or EV charger so generation gets used, not just sold.",
      },
      {
        h: "The technical bit",
        body: "Modern panels are around 400–450 W each; a typical home array of 8–12 panels gives 3.5–5 kWp. Orientation and shading decide real output, which is why we design per aspect instead of quoting a one-size array. Surplus exports for payment under the Smart Export Guarantee — or charges a battery first.",
      },
    ],
    faqs: [
      {
        q: "Do I need planning permission?",
        a: "Usually not — most roof arrays are permitted development. Listed buildings and some conservation areas are the exception, and we flag that at survey.",
      },
      {
        q: "What happens at night or on grey days?",
        a: "Generation falls and the grid (or your battery) covers the gap. Panels still generate in daylight without direct sun, just at a lower rate.",
      },
      {
        q: "Can I add a battery later?",
        a: "Yes — an AC-coupled battery retrofits cleanly to an existing array. If you're thinking about one, telling us now lets us size the inverter for it.",
      },
      {
        q: "How much maintenance is there?",
        a: "Very little — no moving parts. An occasional clean and a periodic electrical check keep it at full output.",
      },
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
      { k: "Warranty", v: "Typically ~10 years from makers" },
    ],
    sections: [
      {
        h: "What we do",
        body: "We size the battery from how your household actually uses electricity — evening load, tariff, and what your solar array produces — then choose AC or DC coupling to suit the system, install it in a safe, ventilated location and set up the tariff scheduling.",
      },
      {
        h: "The technical bit",
        body: "The battery charges when electricity is cheap or free — from your roof, or overnight on an off-peak tariff — and discharges at peak times, so less of your power is ever bought at the day rate. Oversizing wastes money and undersizing wastes sun, which is why sizing comes from your real usage, not a standard bundle.",
      },
    ],
    faqs: [
      {
        q: "Will it run the house in a power cut?",
        a: "Only if the system is specified with backup capability — most standard setups shut down with the grid for safety. If backup matters to you, say so at survey and we design for it.",
      },
      {
        q: "Is it worth it without solar panels?",
        a: "It can be — charging cheap overnight on a time-of-use tariff and using it at peak still cuts bills. It's strongest paired with generation, though.",
      },
      {
        q: "How long does a battery last?",
        a: "Manufacturer warranties commonly run about a decade, and the batteries are built to keep the majority of their capacity through it.",
      },
      {
        q: "Where does it go?",
        a: "Garage, utility, understairs or an external enclosure — somewhere cool, ventilated and out of the way. It's a wall or floor unit about the size of a small suitcase.",
      },
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
      { k: "Flow temp design", v: "35–55 °C by emitter" },
      { k: "Grant", v: "£7,500 Boiler Upgrade Scheme" },
    ],
    sections: [
      {
        h: "What we do",
        body: "A room-by-room heat-loss survey first, then the whole system designed around the numbers: pump sizing, emitters, hot-water cylinder and controls. We install, commission against measured performance — not assumptions — and handle the Boiler Upgrade Scheme paperwork as part of the quote.",
      },
      {
        h: "The technical bit",
        body: "A heat pump's efficiency lives or dies by its flow temperature. Feeding 35 °C underfloor it returns around 4.2 units of heat per unit of electricity; pushed to 55 °C through undersized radiators that drops to ~3.1. That's why we design emitters and pump together — never a box swap.",
      },
    ],
    faqs: [
      {
        q: "Does it still work in a cold winter?",
        a: "Yes — modern units are designed to keep heating well below freezing, and we size the system for your home's heat loss on a cold design day, not an average one.",
      },
      {
        q: "Will I need new radiators?",
        a: "Sometimes. Low-temperature emitters (ThermaSkirt, underfloor, larger radiators) let the pump run at its best. The survey tells you exactly which rooms, if any, need a change.",
      },
      {
        q: "Is it noisy?",
        a: "Modern units are quiet — placement matters more than the pump. We position it away from bedrooms and boundaries as part of the design.",
      },
      {
        q: "Am I eligible for the £7,500 grant?",
        a: "Most owner-occupied homes in England and Wales replacing a fossil-fuel system are. We check eligibility and apply for you — the price you see is after funding.",
      },
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
      { k: "Power", v: "7.4 kW single-phase" },
      { k: "Speed", v: "≈ 25–30 miles of range per hour" },
      { k: "Mode", v: "Solar-aware charging" },
      { k: "Control", v: "Scheduled off-peak charging" },
    ],
    sections: [
      {
        h: "What we do",
        body: "We check your electricity supply has the headroom, run a dedicated protected circuit, fit the charger where the cable actually reaches your parking spot, and set up the app — including solar-priority and off-peak scheduling if you have panels or a smart tariff.",
      },
      {
        h: "The technical bit",
        body: "7.4 kW is the practical maximum on a standard UK single-phase supply — roughly 25–30 miles of range per hour, which fills almost any EV overnight. UK-regulation smart chargers schedule themselves for cheap windows, and solar-aware models divert your surplus generation into the car instead of exporting it.",
      },
    ],
    faqs: [
      {
        q: "Is 7.4 kW fast enough?",
        a: "For home use, yes — plugged in overnight it covers even a near-empty large battery. Faster chargers need a three-phase supply most homes don't have.",
      },
      {
        q: "Tethered or untethered?",
        a: "Tethered (built-in cable) is more convenient day to day; untethered (socket only) is tidier and works with any cable. We fit either.",
      },
      {
        q: "Can it charge from my solar panels?",
        a: "Yes — a solar-aware charger watches your export and tops the car up with surplus generation first, grid second.",
      },
      {
        q: "Does my fuse board need upgrading?",
        a: "Sometimes older boards need a small upgrade for the dedicated circuit — we confirm that at the supply check before quoting, so there are no surprises.",
      },
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
      { k: "Efficiency", v: "Several kWh moved per kWh used" },
      { k: "Control", v: "Per-room, app controlled" },
    ],
    sections: [
      {
        h: "What we do",
        body: "Room-by-room cooling loads first — glazing, aspect, occupancy — then discreet wall units sited where they work without dominating the room, the outdoor unit placed for neighbours and noise, and condensate routed properly. Commissioned and demonstrated before we leave.",
      },
      {
        h: "The technical bit",
        body: "Air conditioning is an air-to-air heat pump, so it moves heat rather than generating it — several kilowatt-hours of cooling or heating per kilowatt-hour of electricity. Reversed in winter it's one of the cheapest ways to heat a single room, which makes it a genuine dual-season system rather than a summer luxury.",
      },
    ],
    faqs: [
      {
        q: "Can it heat as well as cool?",
        a: "Yes — the same unit reverses to heat, very efficiently. Lofts, garden rooms and home offices often use it as their main heating.",
      },
      {
        q: "How noisy is it?",
        a: "Indoor units are designed to be quiet enough for bedrooms on low fan speeds; the outdoor unit is sited away from windows and boundaries as part of the design.",
      },
      {
        q: "Does it need planning permission?",
        a: "The indoor side, no. The outdoor unit is usually fine under permitted development, with placement rules we design to — flats and listed buildings need a closer look.",
      },
      {
        q: "How many rooms can one system do?",
        a: "One outdoor unit can run several indoor units (a multi-split), each with its own control — so bedrooms and living space can be zoned separately.",
      },
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
      { k: "Build-up", v: "Screed, or low-profile overlay" },
    ],
    sections: [
      {
        h: "What we do",
        body: "We assess the floor build-up first — full screed for new floors and extensions, low-profile overlay boards for retrofit — then design the pipe layout and manifold zoning room by room, install, pressure-test and balance every loop before the floor goes down.",
      },
      {
        h: "The technical bit",
        body: "Because the whole floor is the emitter, water at just 35 °C heats the room — the lowest flow temperature of any system, and the reason a heat pump feeding underfloor reaches its best efficiency. Floor covering matters: tile and stone perform best, engineered wood works well, and thick carpet needs designing around.",
      },
    ],
    faqs: [
      {
        q: "Can it be retrofitted without digging up floors?",
        a: "Often, yes — low-profile overlay systems add only a small height on top of the existing floor. The survey tells you what your rooms can take.",
      },
      {
        q: "Does it work under carpet or wood?",
        a: "Engineered wood, yes. Carpet works within limits — underlay and carpet together need to stay reasonably thin or they blanket the heat.",
      },
      {
        q: "Is it slow to warm up?",
        a: "It's steadier rather than instant — designed to hold rooms at temperature efficiently instead of blasting on and off like radiators. Controls handle the schedules.",
      },
      {
        q: "Do I need a heat pump for it?",
        a: "No — it runs from a boiler too. But its low flow temperature is exactly where heat pumps excel, so the pairing is where the running-cost savings live.",
      },
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
    faqs: [
      {
        q: "How disruptive is the installation?",
        a: "A room is typically converted in hours — the old skirting comes off, brackets go on, boards click into place. No walls opened, no floors lifted.",
      },
      {
        q: "Does it fully replace my radiators?",
        a: "In most rooms, yes — the perimeter run is sized against the room's heat loss at survey. Occasionally a large or glazed room keeps a supplementary emitter.",
      },
      {
        q: "Is it safe with curtains and furniture?",
        a: "Yes — it runs at low surface temperatures, warming the room gently from the edges rather than getting hot like a radiator.",
      },
      {
        q: "What if I can't run pipework to a room?",
        a: "That's what ThermaSkirt-e is for — the same boards with a self-regulating electric element, run from a fused spur with its own room thermostat.",
      },
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

                {active.id === "thermaskirt" && (
                  <div className="mt-6">
                    <img
                      src={`${BASE}/media/thermaskirt/install-hallway.jpg`}
                      alt="ThermaSkirt fitted along a panelled hallway with herringbone flooring — the skirting board is the heating"
                      className="w-full border border-night-line"
                      loading="lazy"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-night-faint">
                      Fitted ThermaSkirt — the skirting is the heating. Herringbone hallway,
                      panelled walls, no radiators.
                    </p>
                    <p className="mt-6 font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                      Profile range
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { f: "deco-114-plain", l: "Deco 114" },
                        { f: "ogee-114", l: "Ogee 114" },
                        { f: "bullnose-114", l: "Bull-nose 114" },
                        { f: "deco-170-plain", l: "Deco 170" },
                        { f: "ogee-170", l: "Ogee 170" },
                        { f: "bullnose-170", l: "Bull-nose 170" },
                      ].map((p) => (
                        <figure key={p.f} className="border border-night-line bg-white p-1.5">
                          <img
                            src={`${BASE}/media/thermaskirt/${p.f}.jpg`}
                            alt={`ThermaSkirt ${p.l} profile cutaway`}
                            className="aspect-square w-full object-contain"
                            loading="lazy"
                          />
                          <figcaption className="pb-1 pt-1.5 text-center font-techmono text-[9px] uppercase tracking-[0.12em] text-night-deep">
                            {p.l}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

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

                {active.faqs && (
                  <div className="mt-6">
                    <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                      Common questions
                    </p>
                    <div className="mt-2 divide-y divide-night-line border-y border-night-line">
                      {active.faqs.map((f) => (
                        <details key={f.q} className="group py-3">
                          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 text-sm font-medium text-night-text [&::-webkit-details-marker]:hidden">
                            {f.q}
                            <span
                              aria-hidden
                              className="font-techmono text-xs text-night-faint transition-transform group-open:rotate-45"
                            >
                              +
                            </span>
                          </summary>
                          <p className="mt-2 pr-6 text-sm leading-relaxed text-night-muted">{f.a}</p>
                        </details>
                      ))}
                    </div>
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
