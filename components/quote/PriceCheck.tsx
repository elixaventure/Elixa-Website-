"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ASKS,
  NO_PRICE,
  answered,
  demoFigure,
  labelFor,
  parseDemo,
  pricable,
  type DemoPrices,
  type Figure,
} from "@/content/priceCheck";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { fetchEstimate, ESTIMATE_URL, type Estimate } from "@/lib/estimate";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";
import { handoffLink } from "@/lib/handoff";
import { PriceBar, type Bar } from "@/components/quote/PriceBar";
import { GRANT_QUESTIONS, HEADLINE, SCHEME, assess } from "@/content/grant";

const money = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

type Screen = "ask" | "working" | "price" | "grant" | "talk" | "form" | "done";

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
  // Asked after the figure, never before it. The count does not price the
  // job — emitter sizing comes out of the heat-loss survey — but it tells
  // whoever rings them the size of the conversation, and asking here costs
  // nothing because they have already decided to hear from us.
  const [rads, setRads] = useState("");
  // The grant check. Until it is answered the figure after the grant is
  // shown as a possibility and labelled as one — the scheme is applied for
  // by us and decided by Ofgem, and no questionnaire can do better than
  // "nothing you have told us rules you out".
  const [grantAnswers, setGrantAnswers] = useState<Record<string, string>>({});
  const [grantStep, setGrantStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const top = useRef<HTMLDivElement>(null);
  const ask = ASKS[Math.min(step, ASKS.length - 1)];

  // The demo figures ride in the address, never in the build — see
  // content/priceCheck.ts for why.
  useEffect(() => {
    setDemo(parseDemo(window.location.search));
  }, []);

  // Fired when a figure is on the screen, not when one was worked out —
  // the two differ whenever the estimate comes back unavailable, and the
  // one worth optimising an advert towards is the one somebody saw.
  const seen = useRef(false);
  useEffect(() => {
    if (screen !== "price" || seen.current) return;
    seen.current = true;
    track("estimate_viewed", { source: "price-check", priced: demo ? "link" : "live" });
  }, [screen, demo]);

  useEffect(() => {
    if (top.current && screen !== "ask") top.current.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [screen]);

  const demoFig: Figure | null = useMemo(
    () => (demo && pricable(answers) ? demoFigure(demo, answers) : null),
    [demo, answers],
  );

  /** What to put on screen, from whichever source answered. */
  const figure = demoFig
    ? {
        from: demoFig.from,
        to: demoFig.to,
        beforeFrom: demoFig.beforeGrant,
        beforeTo: demoFig.beforeGrant,
        grant: demoFig.grant,
        grantLabel: SCHEME.name,
      }
    : estimate
      ? {
          from: estimate.total.from,
          to: estimate.total.to,
          beforeFrom: estimate.beforeGrant.from,
          beforeTo: estimate.beforeGrant.to,
          grant: estimate.grant?.amount ?? 0,
          grantLabel: estimate.grant?.label ?? SCHEME.name,
        }
      : null;

  const checked = GRANT_QUESTIONS.every((q) => grantAnswers[q.id]);
  const assessment = checked ? assess(grantAnswers) : null;
  const grantApplies = !assessment || assessment.outcome !== "unlikely";

  /** The three figures, on one scale, as bars. */
  const bars: Bar[] = figure
    ? [
        { label: "Before the grant", from: figure.beforeFrom, to: figure.beforeTo },
        ...(figure.grant > 0 && grantApplies
          ? [
              {
                label: assessment?.outcome === "likely" ? figure.grantLabel : `${figure.grantLabel} — potential`,
                from: 0,
                to: figure.grant,
                note: `−${money(figure.grant)}`,
              },
              {
                label: assessment?.outcome === "likely" ? "You pay" : "If the grant applies",
                from: figure.from,
                to: figure.to,
                lead: true,
              },
            ]
          : []),
      ]
    : [];

  const finish = async (next: Record<string, string>) => {
    track("quick_quote_submit", { source: "price-check", answered: "all" });
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
      bathrooms: next.baths,
      // Lets a business that wants to be more specific key its sizing on
      // "flat:3" rather than "3" alone.
      property: next.prop,
      // They keep the cylinder they have; anything else is left to the
      // sizing rule, which knows what this business fits.
      ...(next.cyl === "yes" ? { litres: 0 } : {}),
      grant: true,
    });
    setEstimate(got);
    setScreen(got ? "price" : "talk");
  };

  const started = useRef(false);

  const choose = (id: string, key: string) => {
    const next = { ...answers, [id]: key };
    setAnswers(next);

    // "Started" means started answering, not landed — PageView already
    // covers landing. It also lands after the cookie banner has usually
    // been dealt with, where an on-mount event fires before anyone has
    // had the chance to say yes and so never reaches Meta at all.
    if (!started.current) {
      started.current = true;
      track("calculator_start", { source: "price-check" });
    }

    // No point asking about a cylinder once we know we are not giving a
    // number. On a page somebody reached by tapping an advert, a question
    // that cannot change the answer only costs the ones who close the tab.
    if (id === "fuel" && !pricable(next)) {
      track("quick_quote_submit", { source: "price-check", outcome: "callback" });
      setScreen("talk");
      return;
    }

    // The first screen holds two questions. Stay on it until both have an
    // answer, rather than jumping away the moment one is tapped.
    if (!answered(ask, next)) return;

    if (step < ASKS.length - 1) {
      // A beat, so the chip that was just tapped is seen to go green.
      setTimeout(() => setStep((v) => v + 1), 200);
      return;
    }
    void finish(next);
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
      property: labelFor("prop", answers.prop),
      bedrooms: labelFor("beds", answers.beds),
      bathrooms: labelFor("baths", answers.baths),
      heats_it_now: labelFor("fuel", answers.fuel),
      hot_water_cylinder: labelFor("cyl", answers.cyl),
      indicative_range: outcome,
      radiators: rads || "Not said",
      grant_check: assessment
        ? `${assessment.outcome} — ${GRANT_QUESTIONS.map(
            (q) => `${q.id}:${grantAnswers[q.id] ?? "—"}`,
          ).join(", ")}`
        : "Not checked",
      cost_before_grant: figure
        ? figure.beforeFrom === figure.beforeTo
          ? money(figure.beforeFrom)
          : `${money(figure.beforeFrom)} – ${money(figure.beforeTo)}`
        : "—",
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

            {ask.groups ? (
              <div className="mt-7 grid gap-6">
                {ask.groups.map((g) => (
                  <div key={g.id}>
                    <span className="mb-2.5 block font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">
                      {g.label}
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {g.options.map((o) => {
                        const on = answers[g.id] === o.key;
                        return (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => choose(g.id, o.key)}
                            aria-pressed={on}
                            className={`min-h-[58px] min-w-[70px] flex-1 rounded-xl border px-4 text-[17px] font-semibold transition-colors ${
                              on
                                ? "border-night-accent bg-night-accent/[0.12] text-night-accent"
                                : "border-night-line bg-night-surface text-night-text hover:border-night-accent/45"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="mt-7 grid gap-2.5">
              {(ask.options ?? []).map((o) => (
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
            )}

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
              {assessment ? HEADLINE[assessment.outcome] : "Your estimate — if the grant applies"}
            </p>
            <p className="v2-narrow mt-4 font-arch text-[2.9rem] font-bold leading-none tracking-[-0.035em] text-night-text tabular-nums sm:text-[4.2rem]">
              {grantApplies ? (
                <>
                  {money(figure.from)}
                  <span className="font-normal text-night-faint"> – </span>
                  {money(figure.to)}
                </>
              ) : (
                <>
                  {money(figure.beforeFrom)}
                  {figure.beforeFrom !== figure.beforeTo && (
                    <>
                      <span className="font-normal text-night-faint"> – </span>
                      {money(figure.beforeTo)}
                    </>
                  )}
                </>
              )}
            </p>

            {grantApplies && figure.grant > 0 && assessment?.outcome !== "likely" && (
              <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-night-muted">
                …if the {figure.grantLabel.toLowerCase()} applies. Without it,{" "}
                {figure.beforeFrom === figure.beforeTo
                  ? money(figure.beforeFrom)
                  : `${money(figure.beforeFrom)} – ${money(figure.beforeTo)}`}
                .
              </p>
            )}

            {/* Before the grant, the grant, and what is left — on one
                scale, so the grant is a length rather than a sentence. */}
            <PriceBar bars={bars} />

            {assessment ? (
              <p
                className={`mt-6 max-w-[52ch] rounded-xl border p-4 text-[13.5px] leading-relaxed ${
                  assessment.outcome === "likely"
                    ? "border-night-accent/35 bg-night-accent/[0.07] text-night-muted"
                    : "border-night-line bg-night-surface text-night-muted"
                }`}
              >
                {assessment.reason}
              </p>
            ) : (
              figure.grant > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setGrantStep(0);
                    setScreen("grant");
                    track("quick_quote_detail", { from: "price-check-grant" });
                  }}
                  className="mt-6 flex min-h-[54px] w-full items-center justify-between gap-4 rounded-xl border border-night-accent/40 bg-night-accent/[0.07] px-5 text-left transition-colors hover:bg-night-accent/[0.12]"
                >
                  <span>
                    <span className="block font-techmono text-[10px] uppercase tracking-[0.18em] text-night-accent">
                      Three questions
                    </span>
                    <span className="mt-1 block text-[14px] text-night-text">
                      Check whether the {figure.grantLabel.toLowerCase()} applies to you
                    </span>
                  </span>
                  <span aria-hidden className="text-night-accent">
                    →
                  </span>
                </button>
              )
            )}

            <dl className="mt-6 border-t border-night-line">
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
            {/* Carries what they just said, so the longer form picks up
                where this left off instead of asking it all again. */}
            <Link
              href={handoffLink(answers)}
              className="mt-3 flex min-h-[58px] w-full items-center justify-center rounded-xl border border-night-line px-6 font-techmono text-[12.5px] uppercase tracking-[0.14em] text-night-text transition-colors hover:border-night-text"
            >
              Get a more accurate estimate
            </Link>
          </motion.div>
        )}

        {/* ---------------------------------------------- grant check --- */}
        {screen === "grant" && (() => {
          const q = GRANT_QUESTIONS[Math.min(grantStep, GRANT_QUESTIONS.length - 1)];
          return (
            <motion.div key={`grant-${q.id}`} {...fade}>
              <div className="mb-7 flex gap-1.5" aria-hidden>
                {GRANT_QUESTIONS.map((x, i) => (
                  <span
                    key={x.id}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                      i <= grantStep ? "bg-night-accent" : "bg-night-line"
                    }`}
                  />
                ))}
              </div>

              <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
                {SCHEME.name}
              </p>
              <h1 className="v2-narrow mt-4 max-w-[16ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
                {q.title}
              </h1>
              {q.hint && (
                <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-night-muted">{q.hint}</p>
              )}

              <div className="mt-7 grid gap-2.5">
                {q.options.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      const next = { ...grantAnswers, [q.id]: o.key };
                      setGrantAnswers(next);
                      if (grantStep < GRANT_QUESTIONS.length - 1) {
                        setGrantStep(grantStep + 1);
                        return;
                      }
                      track("calculator_complete", {
                        source: "price-check",
                        grant: assess(next).outcome,
                      });
                      setScreen("price");
                    }}
                    className="group flex min-h-[62px] items-center justify-between gap-4 rounded-xl border border-night-line bg-night-surface px-5 py-4 text-left transition-colors hover:border-night-accent/45"
                  >
                    <span>
                      <span className="block text-[16.5px] font-semibold text-night-text">{o.label}</span>
                      {o.note && <span className="mt-0.5 block text-[12.5px] text-night-faint">{o.note}</span>}
                    </span>
                    <span aria-hidden className="text-night-faint transition-colors group-hover:text-night-accent">
                      →
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => (grantStep > 0 ? setGrantStep(grantStep - 1) : setScreen("price"))}
                  className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint transition-colors hover:text-night-text"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setScreen("price")}
                  className="font-techmono text-[11px] uppercase tracking-[0.18em] text-night-faint transition-colors hover:text-night-text"
                >
                  Skip this →
                </button>
              </div>

              <p className="mt-8 max-w-[52ch] text-[12px] leading-relaxed text-night-faint">
                We apply for the grant on your behalf, and Ofgem decides. Nothing here is an
                approval — the most these questions can tell you is whether anything obvious rules
                you out.
              </p>
            </motion.div>
          );
        })()}

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

            <div className="mt-5">
              <span className="mb-2.5 block font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">
                Radiators <span className="text-night-faint/70">· optional</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {["Up to 6", "7–10", "11–15", "16+", "None"].map((r) => {
                  const on = rads === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRads(on ? "" : r)}
                      aria-pressed={on}
                      className={`min-h-[46px] rounded-xl border px-4 text-[14px] font-medium transition-colors ${
                        on
                          ? "border-night-accent bg-night-accent/[0.12] text-night-accent"
                          : "border-night-line bg-night-surface text-night-muted hover:border-night-accent/45"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-night-faint">
                Saves a question on the call. A rough count is fine, and skipping it changes
                nothing.
              </p>
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
