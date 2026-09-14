import type { Metadata } from "next";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { QuoteLauncher } from "@/components/quote/QuoteLauncher";
import { site } from "@/content/site";

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

        {/* the wizard — light card on the dark ground */}
        <section className="border-t border-night-line">
          <div className="mx-auto max-w-[1500px] px-0 py-10 md:px-10 md:py-16">
            <div className="border-y border-night-line bg-white px-4 py-8 text-navy md:border md:px-8 md:py-10" data-lenis-prevent>
              <QuoteLauncher />
            </div>
          </div>
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
