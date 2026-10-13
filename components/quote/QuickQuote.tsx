"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  QUESTIONS,
  UNSURE,
  quote,
  describe,
  detailQuestionsFor,
  hasDetail,
  withoutDetail,
  type Answers,
  type Question,
} from "@/content/quickQuote";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";
import { readHandoff, type Handoff } from "@/lib/handoff";
import { fetchEstimate, bandToMetres, ESTIMATE_URL, type Estimate } from "@/lib/estimate";

const money = (n: number) => `£${n.toLocaleString("en-GB")}`;

type Step =
  | { kind: "q"; q: Question; detail?: boolean }
  | { kind: "gate" }
  | { kind: "result" }
  | { kind: "contact" }
  | { kind: "done" };

/**
 * Quick Quote — a short, heat-pump-only qualifier that ends in a price range
 * where the answers allow one, and a callback where they don't.
 *
 * Order matters commercially: the visitor sees the outcome first and is asked
 * for contact details after it, so the details are given by someone who has
 * already seen the number.
 *
 * Two depths, and the split is the point. Seven questions anyone can answer
 * without leaving the sofa, then an optional step — cylinder position, how
 * the pipework runs, which unit — for someone who already knows their own
 * system. The second step is offered, never imposed: skipping it costs the
 * visitor nothing, and it is offered again on the result for anyone who
 * decides they do know after all.
 *
 * Emitters are out of scope and said so out loud. Radiator and underfloor
 * sizing comes from the room-by-room heat loss, and pretending a dropdown
 * can stand in for that would put a number in front of someone that we
 * could not stand behind. So the result names the exclusion and hands over
 * the phone instead.
 */
export function QuickQuote() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [detail, setDetail] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", postcode: "" });
  const [sending, setSending] = useState(false);
  const [route, setRoute] = useState<"posted" | "email">("posted");
  // What the advert landing page already heard, when they came from there.
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  // The figure from the office's own price list, fetched rather than
  // calculated here — see lib/estimate.ts for why.
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimating, setEstimating] = useState(false);

  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = readHandoff(window.location.search);
    if (!h) return;
    setHandoff(h);
    setA((prev) => ({ ...h.answers, ...prev }));
    // Take the answers back out of the address. They are one person's, and
    // a link copied out of the bar and sent to somebody else should not
    // arrive pre-filled with them.
    try {
      const u = new URL(window.location.href);
      ["from", "beds", "baths", "fuel", "cyl"].forEach((k) => u.searchParams.delete(k));
      window.history.replaceState(null, "", u.pathname + (u.search || "") + u.hash);
    } catch {
      /* an address we cannot rewrite is only untidy */
    }
  }, []);

  /**
   * The questions still worth asking.
   *
   * Anything the landing page already heard is gone, at whatever
   * coarseness it heard it. Asking a narrower version of a question
   * somebody has already answered is still asking it again.
   */
  const asks = useMemo(
    () => QUESTIONS.filter((q) => !handoff?.answers[q.id]),
    [handoff],
  );

  // Which extras are worth asking depends on the answers so far — there is
  // no point offering a choice of heat pump to somebody having an electric
  // boiler.
  const detailQs = useMemo(() => detailQuestionsFor(a), [a]);

  const GATE = asks.length;
  const steps = useMemo<Step[]>(
    () => [
      ...asks.map((q) => ({ kind: "q" as const, q })),
      { kind: "gate" as const },
      ...(detail ? detailQs.map((q) => ({ kind: "q" as const, q, detail: true })) : []),
      { kind: "result" as const },
      { kind: "contact" as const },
      { kind: "done" as const },
    ],
    [asks, detail, detailQs],
  );

  const RESULT = GATE + 1 + (detail ? detailQs.length : 0);
  const CONTACT = RESULT + 1;
  const DONE = CONTACT + 1;

  const cur = steps[Math.min(step, steps.length - 1)];
  const result = useMemo(() => quote(a), [a]);

  // Each step is a different height, and the options run well down a phone
  // screen. Without this you tap an answer near the bottom and the next
  // question renders above the fold you are already past. Skipped on first
  // paint so arriving at the page does not yank the header out of view.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  // Asked for once the visitor reaches the result, and only when the
  // answers are ones the office could price: a heat pump, and nothing
  // left as "not sure". Anything else is a job for a person, which is
  // what the page already does.
  const askable =
    a.target === "ashp" && QUESTIONS.every((q) => a[q.id] && a[q.id] !== UNSURE);
  const askKey = askable ? `${a.bedrooms}|${a.property}|${a.distance}` : "";

  useEffect(() => {
    if (cur.kind !== "result" || !askKey || !ESTIMATE_URL) {
      setEstimate(null);
      return;
    }
    const ac = new AbortController();
    let live = true;
    setEstimating(true);
    fetchEstimate(
      {
        bedrooms: a.bedrooms,
        property: a.property,
        ...bandToMetres(a.distance),
        grant: true,
      },
      ac.signal,
    )
      .then((e) => {
        if (live) setEstimate(e);
      })
      .finally(() => {
        if (live) setEstimating(false);
      });
    return () => {
      live = false;
      ac.abort();
    };
    // Deliberately keyed on the answers that change the figure, not on
    // the whole answers object — which gets a new identity on every tap
    // and would re-ask on each one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.kind, askKey]);

  const pick = (id: string, key: string) => {
    setA((prev) => ({ ...prev, [id]: key }));
    // A beat on the highlight before moving, so the choice registers.
    setTimeout(() => setStep((s) => s + 1), 140);
  };

  const openDetail = () => {
    setDetail(true);
    setStep(GATE + 1);
    track("quick_quote_detail", { from: step === GATE ? "offer" : "result" });
  };

  const skipDetail = () => {
    // Clear anything answered on a previous trip through, so the range can
    // never be quietly refined by answers the visitor has since backed out of.
    setA((prev) => withoutDetail(prev));
    setDetail(false);
    setStep(GATE + 1);
  };

  const submit = async () => {
    setSending(true);
    const answers = describe(a);
    const outcome = figure
      ? `${figure.from === figure.to ? money(figure.from) : `${money(figure.from)} – ${money(figure.to)}`}` +
        ` after grant, subject to site survey${estimate ? " (priced from the live list)" : ""}`
      : "Priced by hand — no figure was shown on the website";
    track("quick_quote_submit", {
      outcome: figure ? (figure.firm ? "firm" : "range") : "callback",
      priced: estimate ? "live" : figure ? "built-in" : "by-hand",
      detail: hasDetail(a) ? "yes" : "no",
    });

    const payload: Record<string, string> = {
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      postcode: contact.postcode,
      enquiry_type: "Quick Quote — heat pump",
      indicative_range: outcome,
      // Worth flagging in the inbox: someone who filled in the extra step
      // knows their system, and the emitter conversation is the next call.
      detail_given: hasDetail(a) ? "Yes — extra detail answered" : "No — seven questions only",
      emitters: "Not included — to be discussed by phone",
      source: "quick-quote",
    };
    answers.forEach(({ k, v }) => {
      payload[k.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")] = v;
    });

    if (FORM_ENDPOINT) {
      const { ok } = await submitLead(payload);
      if (ok) {
        setRoute("posted");
        setStep(DONE);
        setSending(false);
        return;
      }
    }

    const body = encodeURIComponent(
      `Name: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nPostcode: ${contact.postcode}\n\n` +
        `QUICK QUOTE — HEAT PUMP\n${answers.map((x) => `${x.k}: ${x.v}`).join("\n")}\n\n` +
        `Indicative range: ${outcome}\nEmitters: not included — to be discussed by phone`,
    );
    setRoute("email");
    window.location.href = `${site.emailHref}?subject=${encodeURIComponent("Quick Quote request")}&body=${body}`;
    setStep(DONE);
    setSending(false);
  };

  const canSend = contact.name.trim() && contact.phone.trim() && contact.postcode.trim();

  /**
   * The figure, from whichever side could produce one.
   *
   * The office's own price list wins where it answers — it is the live
   * one, and the one a customer will be quoted from later. The built-in
   * table is the fallback for a site running without the estimate
   * endpoint. Neither producing anything is the normal state today, and
   * means a person prices it.
   */
  const figure = estimate
    ? {
        firm: estimate.kind === "firm",
        from: estimate.total.from,
        to: estimate.total.to,
        beforeGrant: estimate.beforeGrant,
        grant: estimate.grant?.amount ?? 0,
        grantLabel: estimate.grant?.label ?? "Boiler Upgrade Scheme",
        assumptions: estimate.assumptions ?? [],
        note: estimate.disclaimer,
      }
    : result.kind === "range"
      ? {
          firm: false,
          from: result.from,
          to: result.to,
          beforeGrant: result.beforeGrant,
          grant: result.grant,
          grantLabel: "Boiler Upgrade Scheme",
          assumptions: [] as string[],
          note:
            (result.refined > 0
              ? "Narrowed by the extra detail you gave. Still a guide and not a quotation"
              : "This is a guide from seven answers, not a quotation") +
            ": the real figure comes from a free survey and a room-by-room heat-loss " +
            "calculation — that is what we price from, and it can land either side of this range.",
        }
      : null;

  /** The exclusion, stated the same way wherever it appears. */
  const emitterNote = (
    <div className="mt-12 border border-night-line bg-night-surface/30 p-6 md:p-8">
      <p className="font-techmono text-[11px] uppercase tracking-[0.22em] text-night-accent">
        What this doesn't cover
      </p>
      <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-night-muted">
        Radiators and underfloor heating are not in the figure above. What the emitters need comes
        out of a room-by-room heat-loss calculation, and it is the part that most changes what a
        system costs — too big a question for a form. It is a ten-minute phone call.
      </p>
      <a
        href={site.phoneHref}
        onClick={() => track("phone_click", { context: "quick-quote-emitters" })}
        className="mt-6 inline-flex items-center gap-3 border border-night-accent px-7 py-4 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
      >
        Talk emitters — {site.phoneDisplay}
      </a>
    </div>
  );

  return (
    <div ref={top} className="mx-auto w-full max-w-3xl scroll-mt-28">
      {/* progress — the core seven only, so the optional step never makes
          the visitor feel they are further from the end than they were */}
      {cur.kind === "q" && !cur.detail && (
        <div className="mb-10">
          <div className="flex items-baseline justify-between font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
            <span>
              {String(step + 1).padStart(2, "0")} / {String(asks.length).padStart(2, "0")}
            </span>
            <span>About a minute</span>
          </div>
          <div className="mt-3 h-px w-full bg-night-line">
            <motion.div
              className="h-px bg-night-accent"
              animate={{ width: `${((step + 1) / asks.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}
      {cur.kind === "q" && cur.detail && (
        <div className="mb-10 flex items-baseline justify-between font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
          <span className="text-night-accent">Extra detail</span>
          <span>
            {String(step - GATE).padStart(2, "0")} / {String(detailQs.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {handoff && handoff.carried.length > 0 && cur.kind === "q" && !cur.detail && (
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 rounded-xl border border-night-line bg-night-surface/40 px-4 py-3">
          <p className="text-sm leading-relaxed text-night-muted">
            <span className="font-techmono text-[10px] uppercase tracking-[0.2em] text-night-accent">
              Carried over
            </span>
            <br />
            {handoff.carried.join(" · ")} — so we won't ask again.
          </p>
          {/* Somebody who mis-tapped on the way in needs a way out of it.
              Without this the wrong answer is carried silently and there is
              nothing on screen that can change it. */}
          <button
            type="button"
            onClick={() => {
              setHandoff(null);
              setA({});
              setDetail(false);
              setStep(0);
            }}
            className="font-techmono text-[10px] uppercase tracking-[0.18em] text-night-faint underline underline-offset-4 transition-colors hover:text-night-text"
          >
            Change these
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ---------------------------------------------------- questions --- */}
        {cur.kind === "q" && (
          <motion.div
            key={cur.q.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="v2-narrow max-w-[20ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              {cur.q.title}
            </h2>
            {cur.q.hint && (
              <p className="mt-4 max-w-[52ch] text-base text-night-muted md:text-lg">{cur.q.hint}</p>
            )}

            <div className="mt-8 grid gap-3">
              {cur.q.options.map((o) => {
                const on = a[cur.q.id] === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => pick(cur.q.id, o.key)}
                    aria-pressed={on}
                    className={`flex items-center justify-between gap-4 border px-5 py-5 text-left transition-colors ${
                      on
                        ? "border-night-accent bg-night-accent/10"
                        : o.key === UNSURE
                          ? "border-night-line border-dashed hover:border-night-text/40"
                          : "border-night-line hover:border-night-accent/60"
                    }`}
                  >
                    <span>
                      <span className="block text-base font-medium text-night-text md:text-lg">{o.label}</span>
                      {o.note && <span className="mt-1 block text-sm text-night-faint">{o.note}</span>}
                    </span>
                    <span aria-hidden className={on ? "text-night-accent" : "text-night-faint"}>
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-text"
                >
                  ← Back
                </button>
              )}
              {cur.detail && (
                <button
                  onClick={() => setStep(RESULT)}
                  className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-text"
                >
                  Skip the rest →
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* --------------------------------------------- the detail offer --- */}
        {cur.kind === "gate" && (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              Optional
            </p>
            <h2 className="v2-narrow mt-5 max-w-[22ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Know your own system? Tighten it up.
            </h2>
            <p className="mt-5 max-w-[56ch] text-base text-night-muted md:text-lg">
              {detailQs.length} more questions — where the cylinder goes, how you'd want the
              pipework run, and whether you have a view on the unit itself. Answer them and the
              range narrows. Skip them and you still get one.
            </p>
            <ul className="mt-8 divide-y divide-night-line border-y border-night-line">
              {detailQs.map((q) => (
                <li
                  key={q.id}
                  className="py-3 font-techmono text-[12px] uppercase tracking-[0.16em] text-night-faint md:text-[11px]"
                >
                  {q.title.replace(/\?$/, "")}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={openDetail}
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                Add the detail <span aria-hidden>→</span>
              </button>
              <button
                onClick={skipDetail}
                className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Straight to my range
              </button>
            </div>
            <button
              onClick={() => setStep((s) => s - 1)}
              className="mt-8 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-text"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* ------------------------------------------------------- result --- */}
        {cur.kind === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {estimating ? (
              <>
                <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
                  Working it out
                </p>
                <h2 className="v2-narrow mt-5 max-w-[20ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
                  Pricing this from today's list.
                </h2>
                <p className="mt-5 max-w-[52ch] text-base text-night-muted md:text-lg">
                  One moment — this comes off the same prices our office quotes from, not a
                  guess baked into the website.
                </p>
                <div className="mt-8 h-px w-full overflow-hidden bg-night-line">
                  <motion.div
                    className="h-px w-1/3 bg-night-accent"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </>
            ) : figure ? (
              <>
                <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
                  {figure.firm ? "Your estimate" : "Indicative range"} — subject to site survey
                </p>
                <p className="v2-narrow mt-5 font-arch text-[3.4rem] font-semibold leading-none tracking-[-0.03em] text-night-text md:text-[5.5rem]">
                  {figure.from === figure.to
                    ? money(figure.from)
                    : `${money(figure.from)} – ${money(figure.to)}`}
                </p>
                {figure.grant > 0 && (
                  <p className="mt-5 max-w-[52ch] text-base text-night-muted md:text-lg">
                    After an assumed {money(figure.grant)} {figure.grantLabel} grant, which we apply
                    for on your behalf. Before the grant it would be{" "}
                    {figure.beforeGrant.from === figure.beforeGrant.to
                      ? money(figure.beforeGrant.from)
                      : `${money(figure.beforeGrant.from)} – ${money(figure.beforeGrant.to)}`}
                    .
                  </p>
                )}
                {figure.assumptions.length > 0 && (
                  <ul className="mt-6 max-w-[58ch] space-y-2">
                    {figure.assumptions.map((x) => (
                      <li key={x} className="flex gap-3 text-sm leading-relaxed text-night-muted">
                        <span aria-hidden className="text-night-accent">
                          ·
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-night-faint">
                  {figure.note}
                </p>
              </>
            ) : (
              <>
                <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
                  We'll price this one properly
                </p>
                <h2 className="v2-narrow mt-5 max-w-[20ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
                  Your answers need a human, not a calculator.
                </h2>
                <p className="mt-5 max-w-[56ch] text-base text-night-muted md:text-lg">
                  {result.kind === "callback" && result.reason === "unsure"
                    ? "There's at least one thing you weren't sure about — which is completely normal, and not something to guess at. Leave your details and we'll come back with a proper figure."
                    : "Leave your details and we'll come back with a proper figure."}
                </p>
              </>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setStep(CONTACT)}
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                {figure ? "Book the free survey" : "Get my price"} <span aria-hidden>→</span>
              </button>
              {!hasDetail(a) && (
                <button
                  onClick={openDetail}
                  className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
                >
                  Add more detail
                </button>
              )}
              <button
                onClick={() => {
                  setA({});
                  setDetail(false);
                  setStep(0);
                }}
                className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Start again
              </button>
            </div>

            {emitterNote}

            {/* what they told us, so they can see it was actually used */}
            <dl className="mt-12 divide-y divide-night-line border-y border-night-line">
              {describe(a).map((x) => (
                <div key={x.k} className="flex flex-col gap-1 py-3 md:flex-row md:items-baseline md:justify-between md:gap-6">
                  <dt className="font-techmono text-[12px] uppercase tracking-[0.18em] text-night-faint md:text-[11px]">
                    {x.k}
                  </dt>
                  <dd className="text-base font-medium text-night-text md:text-right md:text-sm">{x.v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}

        {/* ------------------------------------------------------ contact --- */}
        {cur.kind === "contact" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="v2-narrow max-w-[20ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              Where shall we send it?
            </h2>
            <p className="mt-4 max-w-[52ch] text-base text-night-muted md:text-lg">
              A postcode lets us confirm we cover you and which grant rate applies.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                { k: "name", label: "Your name", type: "text", auto: "name" },
                { k: "phone", label: "Phone", type: "tel", auto: "tel" },
                { k: "email", label: "Email (optional)", type: "email", auto: "email" },
                { k: "postcode", label: "Postcode", type: "text", auto: "postal-code" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
                    {f.label}
                  </span>
                  <input
                    type={f.type}
                    autoComplete={f.auto}
                    value={contact[f.k as keyof typeof contact]}
                    onChange={(e) => setContact((c) => ({ ...c, [f.k]: e.target.value }))}
                    className="mt-2 w-full border border-night-line bg-night-surface/40 px-4 py-4 text-base text-night-text outline-none transition-colors placeholder:text-night-faint focus:border-night-accent"
                  />
                </label>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={submit}
                disabled={!canSend || sending}
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night disabled:cursor-not-allowed disabled:border-night-line disabled:text-night-faint disabled:hover:bg-transparent"
              >
                {sending ? "Sending…" : "Send it"} <span aria-hidden>→</span>
              </button>
              <button
                onClick={() => setStep(RESULT)}
                className="font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-text"
              >
                ← Back
              </button>
            </div>
            {!canSend && (
              <p className="mt-4 font-techmono text-[11px] uppercase tracking-[0.14em] text-night-faint">
                Name, phone and postcode needed
              </p>
            )}
          </motion.div>
        )}

        {/* --------------------------------------------------------- done --- */}
        {cur.kind === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
              {route === "posted" ? "Received" : "One more tap"}
            </p>
            <h2 className="v2-narrow mt-5 max-w-[22ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              {route === "posted"
                ? "Thank you — an Elixa specialist will be in touch."
                : "Almost there — press send on the email."}
            </h2>
            <p className="mt-5 max-w-[54ch] text-base text-night-muted md:text-lg">
              {route === "posted"
                ? "We have your answers and we'll come back with the next step. The emitters — radiators or underfloor — are the one thing best settled on the phone, so expect that to come up."
                : "Your email app should have opened with everything filled in. Nothing reaches us until you send it."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-3 border border-night-accent px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-accent transition-colors hover:bg-night-accent hover:text-night"
              >
                {site.phoneDisplay}
              </a>
              <Link
                href="/air-source-heat-pumps"
                className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Heat pumps <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
