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
import { CALL_TIMES, callDays, describeCall, type Slot } from "@/lib/callSlots";
import { PriceBar, type Bar } from "@/components/quote/PriceBar";

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
  // Asked after the figure, never before it. The count does not price the
  // job — emitter sizing comes out of the heat-loss survey — but it tells
  // whoever rings them the size of the conversation, and asking here costs
  // nothing because they have already decided to hear from us.
  const [rads, setRads] = useState("");
  // When they would like ringing. Worked out in the browser, because a
  // page built on Monday would otherwise still be offering Monday as
  // "today" on Thursday.
  const [days, setDays] = useState<Slot[]>([]);
  const [day, setDay] = useState("");
  // On by default, because most homes qualify and it is the figure
  // somebody clicked an advert to see. A switch rather than an assumption:
  // the number moves in front of them, so what the grant is doing to the
  // price is something they watched happen rather than something they have
  // to take on trust.
  const [withGrant, setWithGrant] = useState(true);
  const [time, setTime] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const top = useRef<HTMLDivElement>(null);
  const ask = ASKS[Math.min(step, ASKS.length - 1)];

  // The demo figures ride in the address, never in the build — see
  // content/priceCheck.ts for why.
  useEffect(() => {
    setDemo(parseDemo(window.location.search));
    setDays(callDays());
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
        grantLabel: "Boiler Upgrade Scheme",
      }
    : estimate
      ? {
          from: estimate.total.from,
          to: estimate.total.to,
          beforeFrom: estimate.beforeGrant.from,
          beforeTo: estimate.beforeGrant.to,
          grant: estimate.grant?.amount ?? 0,
          grantLabel: estimate.grant?.label ?? "Boiler Upgrade Scheme",
        }
      : null;

  const grantOn = Boolean(figure && figure.grant > 0 && withGrant);

  /**
   * The three figures, on one scale, as bars.
   *
   * All three stay on screen when the switch moves, and only their
   * lengths change: the grant bar shrinks to nothing and the
   * what-you-pay bar grows to meet the full price. Removing the rows
   * instead would make the answer jump; this way the grant is seen to
   * be the difference.
   */
  const bars: Bar[] = figure
    ? [
        { label: "Full price", from: figure.beforeFrom, to: figure.beforeTo },
        ...(figure.grant > 0
          ? [
              {
                label: figure.grantLabel,
                from: 0,
                to: grantOn ? figure.grant : 0,
                note: grantOn ? `−${money(figure.grant)}` : "Not applied",
              },
              {
                label: "You'd pay",
                from: grantOn ? figure.from : figure.beforeFrom,
                to: grantOn ? figure.to : figure.beforeTo,
                lead: true,
              },
            ]
          : []),
      ]
    : [];

  /** What the headline says, which is the whole point of the switch. */
  const shown = figure
    ? grantOn
      ? { from: figure.from, to: figure.to }
      : { from: figure.beforeFrom, to: figure.beforeTo }
    : null;

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
      grant_assumed:
        figure && figure.grant > 0
          ? `${money(figure.grant)} — shown ${withGrant ? "with" : "without"} it`
          : "None",
      next_step: "Call, then free survey",
      preferred_call: when || "No preference given",
      // The same thing a diary can use. "Tomorrow" stops being true the
      // day after somebody types it; a date does not.
      preferred_call_date: days.find((d) => d.key === day)?.date ?? "",
      preferred_call_window: time || "",
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

  const when = describeCall(
    days.find((d) => d.key === day),
    CALL_TIMES.find((t) => t.key === time),
  );

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
              Your estimate — subject to survey
            </p>
            <p className="v2-narrow mt-4 font-arch text-[2.9rem] font-bold leading-none tracking-[-0.035em] text-night-text tabular-nums sm:text-[4.2rem]">
              {money(shown!.from)}
              {shown!.from !== shown!.to && (
                <>
                  <span className="font-normal text-night-faint"> – </span>
                  {money(shown!.to)}
                </>
              )}
            </p>

            {figure.grant > 0 && (
              <>
                <button
                  type="button"
                  role="switch"
                  aria-checked={withGrant}
                  onClick={() => {
                    setWithGrant((v) => !v);
                    track("quick_quote_detail", { from: "price-check-grant-toggle" });
                  }}
                  className={`mt-5 flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors ${
                    withGrant
                      ? "border-night-accent/45 bg-night-accent/[0.08]"
                      : "border-night-line bg-night-surface"
                  }`}
                >
                  <span>
                    <span className="block text-[15px] font-semibold text-night-text">
                      {money(figure.grant)} {figure.grantLabel}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-night-faint">
                      Most homes qualify. We apply for it for you.
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      withGrant ? "bg-night-accent" : "bg-night-text/20"
                    }`}
                  >
                    <motion.span
                      className="absolute top-1 h-5 w-5 rounded-full bg-night"
                      initial={false}
                      animate={{ left: withGrant ? 26 : 4 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                </button>
                <p className="mt-3 max-w-[50ch] text-[13.5px] leading-relaxed text-night-muted">
                  {withGrant
                    ? `Shown with the grant off the price. Switch it off to see the full ${
                        figure.beforeFrom === figure.beforeTo
                          ? money(figure.beforeFrom)
                          : `${money(figure.beforeFrom)} – ${money(figure.beforeTo)}`
                      }.`
                    : "Shown without it. Most homes do qualify — switch it back on for that figure."}
                </p>
              </>
            )}

            {/* Before the grant, the grant, and what is left — on one
                scale, so the grant is a length rather than a sentence. */}
            <PriceBar bars={bars} />

            {figure.grant > 0 && withGrant && (
              <p className="mt-6 max-w-[54ch] text-[12.5px] leading-relaxed text-night-faint">
                Qualifying is confirmed at the survey rather than from a form, so the figure above
                is what we expect rather than what you have been granted.
              </p>
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
              Arrange my free survey
            </button>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-night-faint">
              A short call first to go through it, then we book the survey in.
            </p>
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
              Arrange my free survey
            </button>
            <p className="mt-3 text-center text-[12.5px] leading-relaxed text-night-faint">
              A short call first to go through it, then we book the survey in.
            </p>
          </motion.div>
        )}

        {/* ----------------------------------------------------- form --- */}
        {screen === "form" && (
          <motion.div key="form" {...fade}>
            <p className="font-techmono text-[10.5px] uppercase tracking-[0.26em] text-night-accent">
              Step one of two
            </p>
            <h1 className="v2-narrow mt-4 max-w-[16ch] font-arch text-[2rem] font-bold leading-[1.02] tracking-[-0.025em] text-night-text sm:text-[2.6rem]">
              Let's get you booked in.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-night-muted">
              We'll call to go through it properly, then arrange the free survey. We work across the
              UK, so the postcode is for getting the right engineer to you.
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

            {days.length > 0 && (
              <div className="mt-6">
                <span className="mb-2.5 block font-techmono text-[10px] uppercase tracking-[0.2em] text-night-faint">
                  When suits for the call?
                </span>
                <div className="flex flex-wrap gap-2">
                  {days.map((d) => {
                    const on = day === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDay(on ? "" : d.key)}
                        aria-pressed={on}
                        className={`min-h-[46px] rounded-xl border px-4 text-[14px] font-medium transition-colors ${
                          on
                            ? "border-night-accent bg-night-accent/[0.12] text-night-accent"
                            : "border-night-line bg-night-surface text-night-muted hover:border-night-accent/45"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CALL_TIMES.map((t) => {
                    const on = time === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTime(on ? "" : t.key)}
                        aria-pressed={on}
                        className={`min-h-[46px] flex-1 rounded-xl border px-4 text-[14px] font-medium transition-colors ${
                          on
                            ? "border-night-accent bg-night-accent/[0.12] text-night-accent"
                            : "border-night-line bg-night-surface text-night-muted hover:border-night-accent/45"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-night-faint">
                  {when
                    ? `We'll ring you ${when}.`
                    : "Pick a day, a time, or both. Leave it and we'll ring when we can."}
                </p>
              </div>
            )}

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
              {sending ? "Sending…" : "Request my call"}
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
              {when ? `Thanks — we'll call ${when}.` : "Thanks — we'll call you."}
            </h1>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-night-muted">
              {contact.name.trim().split(" ")[0]
                ? `We've got everything, ${contact.name.trim().split(" ")[0]}. `
                : ""}
              Here's what happens next.
            </p>
            <ol className="mt-6 grid gap-3">
              {[
                [
                  when ? `A call ${when}` : "A call",
                  "Ten minutes or so. We go through the radiators, the cylinder and anything the form couldn't cover.",
                ],
                ["A free survey", "Booked on that call. Room-by-room heat loss, and the figure we stand behind comes from it."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4 rounded-xl border border-night-line bg-night-surface p-4">
                  <span className="font-techmono text-[13px] text-night-accent">{i + 1}</span>
                  <span>
                    <span className="block text-[15px] font-semibold text-night-text">{t}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-night-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
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
