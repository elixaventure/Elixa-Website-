import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "ThermaSkirt Heated Skirting | Elixa Renewables",
  description:
    "The skirting board becomes the radiator — profiles, sizes, finishes, outputs and the electric ThermaSkirt-e, fitted room by room with no walls opened and no floors lifted.",
};

const PROFILES = [
  { f: "deco-114-plain", l: "Deco 114" },
  { f: "ogee-114", l: "Ogee 114" },
  { f: "bullnose-114", l: "Bull-nose 114" },
  { f: "deco-170-plain", l: "Deco 170" },
  { f: "ogee-170", l: "Ogee 170" },
  { f: "bullnose-170", l: "Bull-nose 170" },
];

const FINISHES = [
  { name: "Cricket White", ral: "RAL 9010", hex: "#F1EDE1" },
  { name: "Vintage Ivory", ral: "RAL 1013", hex: "#E6DCC4" },
  { name: "Anthracite Grey", ral: "RAL 7016", hex: "#383E42" },
  { name: "Carbon Black", ral: "RAL 9011", hex: "#26282B" },
];

const FAQS = [
  {
    q: "How disruptive is the installation?",
    a: "A room is typically converted in hours — the old skirting comes off, brackets go on, boards click into place. No walls opened, no floors lifted.",
  },
  {
    q: "Does it fully replace my radiators?",
    a: "In most rooms, yes — the perimeter run is sized against the room's heat loss at survey. Occasionally a large or heavily glazed room keeps a supplementary emitter.",
  },
  {
    q: "Is it safe with curtains and furniture?",
    a: "Yes — it runs at low surface temperatures, warming the room gently from the edges rather than getting hot like a radiator.",
  },
  {
    q: "What if I can't run pipework to a room?",
    a: "That's what ThermaSkirt-e is for — the same boards with a self-regulating electric element, run from a fused spur with its own room thermostat.",
  },
  {
    q: "Why does it suit heat pumps so well?",
    a: "It's designed for a 40 °C flow temperature — right in the range where a heat pump runs at its best efficiency (around SCOP 4.0). Cool-running emitters are what make heat-pump economics work.",
  },
];

export default function ThermaskirtPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 pb-16 pt-36 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:pb-20 md:pt-44">
          <div>
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            ThermaSkirt — heated skirting
          </p>
          <h1 className="v2-narrow mt-4 max-w-[16ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            The skirting board is the radiator.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            A discreet aluminium emitter that replaces the skirting boards and warms every room from
            its edges — walls freed of radiators, floors left untouched, and a 40 °C flow
            temperature that lets a heat pump run at its best.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="border border-night-accent px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Request a Survey
            </Link>
            <Link
              href="/air-source-heat-pumps"
              className="border border-night-text/25 px-7 py-3.5 font-techmono text-xs uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
            >
              Pair with a heat pump
            </Link>
          </div>
          </div>
          <img
            src={`${BASE}/media/pages/thermaskirt-close.jpg`}
            alt="ThermaSkirt heated skirting fitted below panelled walls on a herringbone floor"
            className="aspect-[4/5] w-full border border-night-line object-cover"
          />
        </header>

        {/* feature install photo */}
        <section className="mx-auto max-w-[1500px] md:px-10">
          <img
            src={`${BASE}/media/thermaskirt/install-hallway.jpg`}
            alt="ThermaSkirt fitted along a panelled hallway with herringbone flooring — the skirting board is the heating"
            className="w-full border-y border-night-line md:border"
          />
          <p className="px-5 pt-3 text-xs leading-relaxed text-night-faint md:px-0">
            Fitted ThermaSkirt — panelled hallway, herringbone floor, no radiators anywhere.
          </p>
        </section>

        {/* the technical facts */}
        <section className="border-t border-night-line mt-14 md:mt-20">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-2 md:gap-16 md:px-10 md:py-20">
            <div>
              <h2 className="v2-narrow max-w-[14ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
                Technical, in one table.
              </h2>
              <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-night-muted md:text-base">
                An aluminium radiant panel built into a 20 mm-deep skirting profile. Warm water — or
                a self-regulating electric element — runs the length of the room at the perimeter,
                emitting gentle, even heat where walls meet floor.
              </p>
              <p className="mt-5 max-w-[46ch] border-l-2 border-night-accent pl-4 text-sm leading-relaxed text-night-text/90">
                Boards click onto concealed brackets with corners, valves and fittings supplied — a
                whole room converted in hours, with no walls opened and no floors lifted.
              </p>
            </div>
            <dl className="grid content-start divide-y divide-night-line self-center border-y border-night-line">
              {[
                ["Flow temperature", "40 °C — heat-pump ready"],
                ["Heat pump SCOP", "≈ 4.0"],
                ["Output (Deco 114 / 170 mm)", "up to ≈126 / ≈188 W per metre"],
                ["Depth off the wall", "just 20 mm"],
                ["Lengths", "2 m · 3 m · 6 m, cut on site"],
                ["Electric version", "ThermaSkirt-e, per-room stat"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint">
                    {k}
                  </dt>
                  <dd className="text-right text-sm font-medium text-night-text md:text-base">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* profiles */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[18ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Styles for modern and period homes.
            </h2>
            <p className="mt-5 max-w-[58ch] text-sm leading-relaxed text-night-muted md:text-base">
              Deco is the modern flat profile in 114 mm and 170 mm heights with plain, torus or
              ovolo top-caps; the ogee and bull-nose profiles keep the traditional look for
              Victorian and Edwardian homes where period skirting has to stay period.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {PROFILES.map((p) => (
                <figure key={p.f} className="border border-night-line bg-white p-2">
                  <img
                    src={`${BASE}/media/thermaskirt/${p.f}.jpg`}
                    alt={`ThermaSkirt ${p.l} profile cutaway`}
                    className="aspect-square w-full object-contain"
                    loading="lazy"
                  />
                  <figcaption className="pb-1 pt-2 text-center font-techmono text-[9px] uppercase tracking-[0.12em] text-night-deep">
                    {p.l}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* finishes */}
            <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-16">
              <div>
                <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                  Finishes
                </p>
                <ul className="mt-4 grid gap-3">
                  {FINISHES.map((f) => (
                    <li key={f.name} className="flex items-center gap-4">
                      <span
                        className="h-7 w-12 flex-none rounded-[3px] border border-night-line"
                        style={{ backgroundColor: f.hex }}
                      />
                      <span className="text-sm text-night-text md:text-base">{f.name}</span>
                      <span className="ml-auto font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">
                        {f.ral}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center gap-4">
                    <span
                      className="h-7 w-12 flex-none rounded-[3px] border border-night-line"
                      style={{
                        background:
                          "linear-gradient(90deg,#c0392b,#e67e22,#f1c40f,#27ae60,#2980b9,#8e44ad)",
                      }}
                    />
                    <span className="text-sm text-night-text md:text-base">Any RAL colour</span>
                    <span className="ml-auto font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">
                      to order
                    </span>
                  </li>
                </ul>
                <p className="mt-4 max-w-[46ch] text-xs leading-relaxed text-night-faint">
                  Tough double epoxy powder coat. Swatch colours indicative — samples available with
                  your survey.
                </p>
              </div>
              <div>
                <p className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
                  ThermaSkirt-e — the electric version
                </p>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-night-muted md:text-base">
                  The same boards with a self-regulating electric element inside instead of
                  pipework — it caps itself at around 95 °C, runs from a standard fused spur, and
                  each room gets its own digital thermostat. Ideal for extensions, lofts, garden
                  rooms and homes without a wet system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="border-t border-night-line">
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-16 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[12ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Common questions.
            </h2>
            <div className="divide-y divide-night-line border-y border-night-line">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 text-base font-medium text-night-text [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden
                      className="font-techmono text-sm text-night-faint transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[64ch] pr-6 text-sm leading-relaxed text-night-muted md:text-base">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-night-line">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8 px-5 py-14 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[18ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Walls back. Warmth everywhere.
            </h2>
            <Link
              href="/quote"
              className="inline-flex items-center gap-3 border border-night-accent px-8 py-4 font-techmono text-xs uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
            >
              Book the free survey <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
