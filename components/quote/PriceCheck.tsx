"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ASKS,
  NO_PRICE,
  demoFigure,
  parseDemo,
  pricable,
  type DemoPrices,
  type Figure,
} from "@/content/priceCheck";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { fetchEstimate, ESTIMATE_URL, type Estimate } from "@/lib/estimate";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";

const money = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

type Screen = "ask" | "working" | "price" | "talk" | "form" | "done";

/**
 * Price Check — the advert landing page.
 *
 * Three taps and a figure. Everything about it is shaped by where the
 * visitor came from: they tapped an advert, they have given you seconds,
 * and the page has no navigation because every link away from it is a way
 * to fail at its one job.
 *
 * Where the figure comes from, in order:
 *
 *   1. a ?demo= link, which carries its own numbers — for showing the page
 *      to somebody before the real price list is switched on
 *   2. the live estimate, worked out in Supabase from the price list in the
 *      installers' app
 *   3. nothing, and the visitor is offered a conversation instead
 *
 * Electric heaters and "something else" never reach the arithmetic at all:
 * a home with no wet system is a different and much bigger job, and a
 * number off three taps would be wrong in the direction that loses it at
 * survey.
 */
export function PriceCheck() {
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState<Screen>("ask");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [demo, setDemo] = useState<DemoPrices | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", postcode: "" });
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const top = useRef<HTMLDivElement>(null);
  const ask = ASKS[Math.min(step, ASKS.length - 1)];

  // The demo figures ride in the address, never in the build — see
  // content/priceCheck.ts for why.
  useEffect(() => {
    setDemo(parseDemo(window.location.search));
  }, []);

  useEffect(() => {
    if (top.current && screen !== "ask") top.current.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [screen]);

  const demoFig: Figure | null = useMemo(
    () => (demo && pricable(answers) ? demoFigure(demo, answers) : null),
    [demo, answers],
  );

  /** What to put on screen, from whichever source answered. */
  const figure = demoFig
    ? { from: demoFig.from, to: demoFig.to, grant: demoFig.grant, grantLabel: "Boiler Upgrade Scheme" }
    : estimate
      ? {
          from: estimate.total.from,
          to: estimate.total.to,
          grant: estimate.grant?.amount ?? 0,
          grantLabel: estimate.grant?.label ?? "Boiler Upgrade Scheme",
        }
      : null;

  const choose = async (id: string, key: string) => {
    const next = { ...answers, [id]: key };
    setAnswers(next);

    // No point asking about a cylinder once we know we are not giving a
    // number. On a page somebody reached by tapping an advert, a question
    // that cannot change the answer only costs the ones who close the tab.
    if (id === "fuel" && !pricable(next)) {
      track("quick_quote_submit", { source: "price-check", answered: "2", outcome: "callback" });
      setScreen("talk");
      return;
    }

    if (step < ASKS.length - 1) {
      setStep(step + 1);
      return;
    }

    track("quick_quote_submit", { source: "price-check", answered: "3" });

    if (!pricable(next)) {
      setScreen("talk");
      return;
    }
    // A demo link already has everything it needs.
    if (demo) {
      setScreen("price");
      return;
    }
    if (!ESTIMATE_URL) {
      setScreen("talk");
      return;
    }
    setScreen("working");
    const got = await fetchEstimate({
      bedrooms: next.beds,
      // They keep the cylinder they have; anything else is left to the
      // sizing rule, which knows what this business fits.
      ...(next.cyl === "yes" ? { litres: 0 } : {}),
      grant: true,
    });
    setEstimate(got);
    setScreen(got ? "price" : "talk");
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const copyNumber = () => {
    const plain = site.phoneDisplay.replace(/\s+/g, "");
    navigator.clipboard?.writeText(plain).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {
        /* Refused. The number is selectable text, so it can still be taken. */
      },
    );
    track("phone_click", { context: "price-check-copy" });
  };

  const send = async () => {
    setSending(true);
    const outcome = figure
      ? `${money(figure.from)} – ${money(figure.to)} after grant${demoFig ? " (DEMO LINK — not a real price)" : ""}`
      : "No figure shown — answers needed a person";
    const payload: Record<string, string> = {
      name: contact.name,
      phone: contact.phone,
      postcode: contact.postcode,
      enquiry_type: "Price Check — advert landing page",
      bedrooms: ASKS[0].options.find((o) => o.key === answers.beds)?.label ?? "—",
      heats_it_now: ASKS[1].options.find((o) => o.key === answers.fuel)?.label ?? "—",
      hot_water_cylinder: ASKS[2].options.find((o) => o.key === answers.cyl)?.label ?? "—",
      indicative_range: outcome,
      emitters: "Not included — to be discussed by phone",
      source: "price-check",
    };
    if (FORM_ENDPOINT) await submitLead(payload);
    track("survey_booking", { source: "price-check" });
    setSending(false);
    setScreen("done");
  };

  const canSend = contact.name.trim() && contact.phone.trim() && contact.postcode.trim();

  /* ------------------------------------------------------- pieces --- */

  const phoneBlock = (
    <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-dashed border-night-line px-5 py-4">
      <div className="min-w-0">
        <span className="block font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">
          Talk it through
        </span>
        <span className="mt-1 block select-all font-techmono text-[17px] text-night-text">
          {site.phoneDisplay}
        </span>
      </div>
      <button
        type="button"
        onClick={copyNumber}
        className="flex min-h-[44px] shrink-0 items-center rounded-full border border-night-line px-5 font-techmono text-[10px] uppercase tracking-[0.1em] text-night-muted transition-colors hover:border-night-accent hover:text-night-accent"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div ref={top} className="mx-auto w-full max-w-[560px] scroll-mt-6">
      {demo && (
        <p className="mb-7 rounded-xl border border-[#E8B14C]/30 bg-[#E8B14C]/10 px-4 py-3 font-techmono text-[10.5px] uppercase leading-relaxed tracking-[0.06em] text-[#E8B14C]">
          Preview — the figures below came from this link, not from our price list
        </p>
      )}

      {/* progress */}
      {screen === "ask" && (
        <div className="mb-8 flex gap-1.5" aria-hidden>
          {ASKS.map((a, i) => (
            <span
              key={a.id}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-night-accent" : "bg-night-line"
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ------------------------------------------------ questions --- */}
        {screen === "ask" && (
          <motion.div key={ask.id} {...fade}>
            <h1 className="v2-narrow max-w-[16ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              {ask.title}
            </h1>
            {ask.hint && (
              <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-night-muted">{ask.hint}</p>
            )}

            <div className="mt-7 grid gap-2.5">
              {ask.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => choose(ask.id, o.key)}
                  className="group flex min-h-[62px] items-center justify-between gap-4 rounded-xl border border-night-line bg-night-surface px-5 py-4 text-left transition-colors hover:border-night-accent/45 hover:bg-night-surface/70"
                >
                  <span>
                    <span className="block text-[16.5px] font-semibold text-night-text">{o.label}</span>
                    {o.note && <span className="mt-0.5 block text-[12.5px] text-night-faint">{o.note}</span>}
                  </span>
                  <span
                    aria-hidden
                    className="text-night-faint transition-colors group-hover:text-night-accent"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-7 font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint transition-colors hover:text-night-text"
              >
                ← Back
              </button>
            )}
          </motion.div>
        )}

        {/* -------------------------------------------------- working --- */}
        {screen === "working" && (
          <motion.div key="working" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Working it out
            </p>
            <h1 className="v2-narrow mt-5 max-w-[18ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              Pricing this from today's list.
            </h1>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-night-muted">
              One moment — this comes off the same prices our office quotes from.
            </p>
            <div className="mt-8 h-px w-full overflow-hidden bg-night-line">
              <motion.div
                className="h-px w-1/3 bg-night-accent"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- price --- */}
        {screen === "price" && figure && (
          <motion.div key="price" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Your estimate — subject to survey
            </p>
            <p className="v2-narrow mt-4 font-arch text-[2.9rem] font-bold leading-none tracking-[-0.035em] text-night-text tabular-nums sm:text-[4.2rem]">
              {money(figure.from)}
              <span className="font-normal text-night-faint"> – </span>
              {money(figure.to)}
            </p>

            <dl className="mt-7 border-t border-night-line">
              {figure.grant > 0 && (
                <div className="flex justify-between gap-4 border-b border-night-line py-3 text-[14.5px]">
                  <dt className="text-night-muted">{figure.grantLabel}</dt>
                  <dd className="font-techmono tabular-nums text-night-accent">−{money(figure.grant)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-b border-night-line py-3 text-[14.5px]">
                <dt className="text-night-muted">VAT</dt>
                <dd className="font-techmono text-night-text">Zero-rated</dd>
              </div>
            </dl>

            {estimate?.assumptions?.length ? (
              <ul className="mt-5 space-y-2">
                {estimate.assumptions.map((x) => (
                  <li key={x} className="flex gap-3 text-[13px] leading-relaxed text-night-muted">
                    <span aria-hidden className="text-night-accent">
                      ·
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="mt-5 max-w-[50ch] text-[13px] leading-relaxed text-night-faint">
              {demoFig
                ? "These figures came from the link you opened, so treat them as an illustration of the page rather than a price."
                : "An estimate from three answers is not a quotation. The figure we stand behind comes from a free survey and a room-by-room heat-loss calculation."}
            </p>

            <div className="mt-7 rounded-xl border border-night-line bg-night-surface p-5">
              <h2 className="font-techmono text-[10.5px] uppercase tracking-[0.2em] text-night-accent">
                What this doesn't cover
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-night-muted">
                Radiators and underfloor heating aren't in that figure. What your emitters need comes
                out of a room-by-room heat-loss calculation, and it's the part that most changes what a
                system costs. It's a ten-minute phone call.
              </p>
            </div>

            {phoneBlock}

            <button
              type="button"
              onClick={() => setScreen("form")}
              className="mt-6 flex min-h-[58px] w-full items-center justify-center rounded-xl bg-night-accent px-6 font-techmono text-[12.5px] uppercase tracking-[0.14em] text-night transition-opacity hover:opacity-90"
            >
              Book my free survey
            </button>
            <Link
              href="/quick-quote"
              className="mt-3 flex min-h-[58px] w-full items-center justify-center rounded-xl border border-night-line px-6 font-techmono text-[12.5px] uppercase tracking-[0.14em] text-night-text transition-colors hover:border-night-text"
            >
              Answer more, narrow it down
            </Link>
          </motion.div>
        )}

        {/* ----------------------------------------------------- talk --- */}
        {screen === "talk" && (
          <motion.div key="talk" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Worth a conversation
            </p>
            <h1 className="v2-narrow mt-4 max-w-[18ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              Yours needs a person, not a calculator.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-night-muted">
              {NO_PRICE[answers.fuel] ??
                "Leave your details and we'll come back with a proper figure, worked out rather than guessed."}
            </p>

            {phoneBlock}

            <button
              type="button"
              onClick={() => setScreen("form")}
              className="mt-6 flex min-h-[58px] w-full items-center justify-center rounded-xl bg-night-accent px-6 font-techmono text-[12.5px] uppercase tracking-[0.14em] text-night transition-opacity hover:opacity-90"
            >
              Book my free survey
            </button>
          </motion.div>
        )}

        {/* ----------------------------------------------------- form --- */}
        {screen === "form" && (
          <motion.div key="form" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Free survey
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              Where shall we send it?
            </h1>
            <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-night-muted">
              A postcode lets us confirm we cover you and which grant rate applies.
            </p>

            <div className="mt-7 grid gap-3">
              {[
                { k: "name", label: "Your name", type: "text", auto: "name" },
                { k: "phone", label: "Phone", type: "tel", auto: "tel" },
                { k: "postcode", label: "Postcode", type: "text", auto: "postal-code" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="mb-1.5 block font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">
                    {f.label}
                  </span>
                  <input
                    id={`pc-${f.k}`}
                    type={f.type}
                    autoComplete={f.auto}
                    value={contact[f.k as keyof typeof contact]}
                    onChange={(e) => setContact((c) => ({ ...c, [f.k]: e.target.value }))}
                    className="min-h-[52px] w-full rounded-xl border border-night-line bg-night-surface px-4 text-[16px] text-night-text outline-none transition-colors focus:border-night-accent"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={send}
              disabled={!canSend || sending}
              className="mt-6 flex min-h-[58px] w-full items-center justify-center rounded-xl bg-night-accent px-6 font-techmono text-[12.5px] uppercase tracking-[0.14em] text-night transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-night-surface disabled:text-night-faint"
            >
              {sending ? "Sending…" : "Send it"}
            </button>
            {!canSend && (
              <p className="mt-3 font-techmono text-[10px] uppercase tracking-[0.14em] text-night-faint">
                Name, phone and postcode needed
              </p>
            )}
            <button
              type="button"
              onClick={() => setScreen(figure ? "price" : "talk")}
              className="mt-6 font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint transition-colors hover:text-night-text"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ----------------------------------------------------- done --- */}
        {screen === "done" && (
          <motion.div key="done" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Received
            </p>
            <h1 className="v2-narrow mt-4 max-w-[18ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              Thanks — we'll be in touch.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-night-muted">
              {contact.name.trim().split(" ")[0]
                ? `We've got your details, ${contact.name.trim().split(" ")[0]}. `
                : ""}
              Somebody will call to book the survey in. The emitters — radiators or underfloor — are
              the one thing best settled on the phone, so expect that to come up.
            </p>
            {phoneBlock}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-9 border-t border-night-line pt-5 text-[12px] leading-relaxed text-night-faint">
        {site.legalName} · MCS Partner · Gas Safe Registered.{" "}
        <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-night-muted">
          Privacy
        </Link>
      </p>
    </div>
  );
}
