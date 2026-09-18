import type { Metadata } from "next";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { QuoteLauncher } from "@/components/quote/QuoteLauncher";
import { site } from "@/content/site";

/**
 * The dark-to-light ramp either side of the form. Eased rather than linear —
 * it holds the near-black a while, then lifts quickly — so the change reads
 * as light arriving rather than as a grey band.
 */
const STOPS = [
  "#080B0F 0%",
  "#0D141B 14%",
  "#1A232D 30%",
  "#313D4A 46%",
  "#55626F 62%",
  "#7E8B97 76%",
  "#ABB6C0 87%",
  "#D4DBE2 95%",
  "#EEF2F6 100%",
];
const RISE = `linear-gradient(to bottom, ${STOPS.join(", ")})`;
const FALL = `linear-gradient(to top, ${STOPS.join(", ")})`;

export const metadata: Metadata = {
  title: "Request a Survey | Elixa Renewables",
  description:
    "Book a free, no-obligation survey with Elixa Renewables — solar, battery storage, heat pumps, air conditioning, heating or EV charging, designed from your home's real numbers.",
};

export default function QuotePage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        {/* header */}
        <header className="mx-auto max-w-[1500px] px-5 pb-10 pt-36 md:px-10 md:pb-12 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Request a survey
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-night-text text-4xl font-semibold leading-[1.0] tracking-[-0.02em] md:text-7xl">
            Tell us about your project.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            A few quick questions and a specialist comes back with honest advice and a
            no-obligation quote — grants already applied where your home qualifies. Prefer to
            talk?{" "}
            <a href={site.phoneHref} className="font-medium text-night-accent underline decoration-night-accent/40 underline-offset-4 hover:decoration-night-accent">
              Call {site.phoneDisplay}
            </a>
            .
          </p>
        </header>

        {/* the wizard — the page eases from the dark ground into daylight,
            the form's own card floats on the light, then it fades back down
            into the footer. No hard edge anywhere. */}
        <section>
          <div aria-hidden className="h-36 w-full md:h-56" style={{ background: RISE }} />
          <div className="bg-[#EEF2F6]">
            <div className="mx-auto max-w-[1500px] px-5 pb-14 text-navy md:px-10 md:pb-20" data-lenis-prevent>
              <QuoteLauncher />
            </div>
          </div>
          <div aria-hidden className="h-36 w-full md:h-56" style={{ background: FALL }} />
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
