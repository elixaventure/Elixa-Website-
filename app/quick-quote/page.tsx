import type { Metadata } from "next";
import Link from "next/link";
import { SmoothScroll } from "@/components/v2/SmoothScroll";
import { NavV2 } from "@/components/v2/Nav";
import { FooterV2 } from "@/components/v2/FooterV2";
import { QuickQuote } from "@/components/quote/QuickQuote";

export const metadata: Metadata = {
  title: "Quick Quote — Heat Pumps",
  description:
    "Seven questions and an indicative heat pump price range, with the Boiler Upgrade Scheme grant applied. Not sure on something? We'll price it by hand.",
};

export default function QuickQuotePage() {
  return (
    <SmoothScroll>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain bg-night font-arch text-night-text antialiased">
        <NavV2 />

        <header className="mx-auto max-w-[1500px] px-5 pb-10 pt-36 md:px-10 md:pb-12 md:pt-44">
          <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
            Quick quote — heat pumps
          </p>
          <h1 className="v2-narrow mt-4 max-w-[18ch] text-4xl font-semibold leading-[1.0] tracking-[-0.02em] text-night-text md:text-7xl">
            A heat pump price, in about a minute.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-night-muted md:text-lg">
            Seven questions about your home and what you're replacing. Not sure about one of them?
            Say so — we'd rather work it out than have you guess. Looking for solar, battery, EV
            charging or air conditioning instead?{" "}
            <Link href="/quote" className="text-night-accent transition-colors hover:text-night-text">
              Use the full enquiry form
            </Link>
            .
          </p>
        </header>

        <section className="px-5 pb-24 md:px-10 md:pb-36">
          <QuickQuote />
        </section>

        <FooterV2 />
      </div>
    </SmoothScroll>
  );
}
