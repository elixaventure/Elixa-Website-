import type { Metadata } from "next";
import { PriceCheck } from "@/components/quote/PriceCheck";

/**
 * The advert landing page.
 *
 * No navigation, no footer, nothing to leave by — see BARE_ROUTES in
 * lib/v2Routes. Somebody who has just paid to put a person in front of this
 * page does not want to hand them a menu.
 *
 * Kept out of search on purpose. It exists to be linked to from an advert,
 * and a landing page competing with the real pages for the same searches
 * helps nobody.
 */
export const metadata: Metadata = {
  title: "What would a heat pump cost?",
  description:
    "Three questions and an estimate for an air source heat pump, with the Boiler Upgrade Scheme grant taken off. Subject to a free survey.",
  robots: { index: false, follow: false },
};

export default function PriceCheckPage() {
  return (
    <>
      <style>{`html, body { background-color: #080B0F; }`}</style>
      <div className="v2-grain min-h-screen bg-night font-arch text-night-text antialiased">
        {/* A mark rather than a logo and a menu: enough to say who this is,
            with nothing to click away on. */}
        <header className="mx-auto w-full max-w-[560px] px-5 pb-2 pt-9">
          <div className="flex items-center gap-2.5 font-techmono text-[11px] uppercase tracking-[0.26em] text-night-accent">
            <span
              aria-hidden
              className="h-[7px] w-[7px] rounded-full bg-night-accent shadow-[0_0_14px_#3EC5B4]"
            />
            Elixa Renewables
          </div>
        </header>

        <main className="px-5 pb-20 pt-4">
          <PriceCheck />
        </main>
      </div>
    </>
  );
}
