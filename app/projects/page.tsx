import { existsSync } from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { INSTALLS } from "@/content/installs";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Our Work — Real Installs | Elixa Renewables",
  description:
    "Real Elixa installations, photographed by the team — solar, heat pumps, cylinders and underfloor heating, fitted properly and shown as found.",
};

/** build-time check so a missing photo renders a clean frame, never a broken image */
function hasPhoto(id: string) {
  return existsSync(path.join(process.cwd(), "public/media/projects", `${id}.jpg`));
}

export default function ProjectsPage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-14 pt-36 md:px-10 md:pb-16 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Projects — our work
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            Real homes. Real kit. Our installs.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            Every photo on this page is an Elixa installation, photographed by the team that fitted
            it — the outdoor units, the plant rooms, and the pipework nobody usually shows you.
          </p>
        </header>

        {/* installs — alternating editorial rows */}
        <section className="border-t border-night-line">
          {INSTALLS.map((p, i) => (
            <article key={p.id} id={p.id} className="scroll-mt-24 border-b border-night-line">
              <div
                className={`mx-auto grid max-w-[1500px] items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16 ${
                  i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {hasPhoto(p.id) ? (
                  <img
                    src={`${BASE}/media/projects/${p.id}.jpg`}
                    alt={p.alt}
                    loading={i > 0 ? "lazy" : undefined}
                    className="aspect-[4/5] w-full border border-night-line object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 border border-night-line bg-night-surface/40">
                    <span className="font-techmono text-2xl text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-faint">
                      Photograph to follow
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-techmono text-[11px] text-night-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-techmono text-[11px] uppercase tracking-[0.24em] text-night-accent">
                      {p.tag}
                    </p>
                  </div>
                  <h2 className="v2-narrow mt-3 max-w-[18ch] text-night-text text-3xl font-semibold tracking-[-0.01em] md:text-5xl">
                    {p.title}
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-night-muted md:text-base">
                    {p.blurb}
                  </p>
                  <ul className="mt-6 grid gap-2.5 border-l-2 border-night-accent pl-4">
                    {p.kit.map((k) => (
                      <li key={k} className="text-sm font-medium text-night-text/90 md:text-base">
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* CTA */}
        <section className="border-t border-night-line">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-8 px-5 py-14 md:px-10 md:py-20">
            <h2 className="v2-narrow max-w-[18ch] text-night-text text-3xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl">
              Yours could be next on this page.
            </h2>
            <Link
              href="/quote"
              className="inline-flex items-center gap-3 border border-night-accent px-9 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
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
