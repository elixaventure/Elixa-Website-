"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, UNSURE, quote, describe, type Answers } from "@/content/quickQuote";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";

const money = (n: number) => `£${n.toLocaleString("en-GB")}`;

/**
 * Quick Quote — a short, heat-pump-only qualifier that ends in a price range
 * where the answers allow one, and a callback where they don't.
 *
 * Order matters commercially: the visitor sees the outcome first and is asked
 * for contact details after it, so the details are given by someone who has
 * already seen the number.
 */
export function QuickQuote() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [contact, setContact] = useState({ name: "", phone: "", email: "", postcode: "" });
  const [sending, setSending] = useState(false);
  const [route, setRoute] = useState<"posted" | "email">("posted");

  const top = useRef<HTMLDivElement>(null);

  const RESULT = QUESTIONS.length;
  const CONTACT = RESULT + 1;
  const DONE = CONTACT + 1;

  const result = useMemo(() => quote(a), [a]);
  const q = QUESTIONS[step];

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

  const pick = (key: string) => {
    setA((prev) => ({ ...prev, [q.id]: key }));
    // A beat on the highlight before moving, so the choice registers.
    setTimeout(() => setStep((s) => s + 1), 140);
  };

  const submit = async () => {
    setSending(true);
    const answers = describe(a);
    const outcome =
      result.kind === "range"
        ? `${money(result.from)} – ${money(result.to)} after grant`
        : "Priced by hand — visitor was unsure on at least one answer";
    track("quick_quote_submit", { outcome: result.kind });

    const payload: Record<string, string> = {
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      postcode: contact.postcode,
      enquiry_type: "Quick Quote — heat pump",
      indicative_range: outcome,
      source: "quick-quote",
    };
    answers.forEach(({ k, v }) => {
      payload[k.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")] = v;
    });

    if (FORM_ENDPOINT) {
      const ok = await submitLead(payload);
      if (ok) {
        setRoute("posted");
        setStep(DONE);
        setSending(false);
        return;
      }
    }

    const body = encodeURIComponent(
      `Name: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nPostcode: ${contact.postcode}\n\n` +
        `QUICK QUOTE — HEAT PUMP\n${answers.map((x) => `${x.k}: ${x.v}`).join("\n")}\n\nIndicative range: ${outcome}`,
    );
    setRoute("email");
    window.location.href = `${site.emailHref}?subject=${encodeURIComponent("Quick Quote request")}&body=${body}`;
    setStep(DONE);
    setSending(false);
  };

  const canSend = contact.name.trim() && contact.phone.trim() && contact.postcode.trim();

  return (
    <div ref={top} className="mx-auto w-full max-w-3xl scroll-mt-28">
      {/* progress */}
      {step < RESULT && (
        <div className="mb-10">
          <div className="flex items-baseline justify-between font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint">
            <span>
              {String(step + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
            </span>
            <span>About a minute</span>
          </div>
          <div className="mt-3 h-px w-full bg-night-line">
            <motion.div
              className="h-px bg-night-accent"
              animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ---------------------------------------------------- questions --- */}
        {step < RESULT && (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="v2-narrow max-w-[20ch] font-arch text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-night-text md:text-5xl">
              {q.title}
            </h2>
            {q.hint && <p className="mt-4 max-w-[52ch] text-base text-night-muted md:text-lg">{q.hint}</p>}

            <div className="mt-8 grid gap-3">
              {q.options.map((o) => {
                const on = a[q.id] === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => pick(o.key)}
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

            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-8 font-techmono text-[11px] uppercase tracking-[0.2em] text-night-faint transition-colors hover:text-night-text"
              >
                ← Back
              </button>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------------- result --- */}
        {step === RESULT && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {result.kind === "range" ? (
              <>
                <p className="font-techmono text-[11px] uppercase tracking-[0.3em] text-night-accent">
                  Indicative range
                </p>
                <p className="v2-narrow mt-5 font-arch text-[3.4rem] font-semibold leading-none tracking-[-0.03em] text-night-text md:text-[5.5rem]">
                  {money(result.from)} – {money(result.to)}
                </p>
                {result.grant > 0 && (
                  <p className="mt-5 max-w-[52ch] text-base text-night-muted md:text-lg">
                    After an assumed {money(result.grant)} Boiler Upgrade Scheme grant, which we apply
                    for on your behalf. Before the grant it would be{" "}
                    {money(result.beforeGrant.from)} – {money(result.beforeGrant.to)}.
                  </p>
                )}
                <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-night-faint">
                  This is a guide from seven answers, not a quotation. The real figure comes from a
                  free survey and a room-by-room heat-loss calculation — that is what we price from,
                  and it can land either side of this range.
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
                  {result.reason === "unsure"
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
                {result.kind === "range" ? "Book the free survey" : "Get my price"} <span aria-hidden>→</span>
              </button>
              <button
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-3 border border-night-text/25 px-8 py-5 font-techmono text-sm uppercase tracking-[0.16em] text-night-text transition-colors hover:border-night-text/60"
              >
                Start again
              </button>
            </div>

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
        {step === CONTACT && (
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
        {step === DONE && (
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
                ? "We have your answers and we'll come back with the next step. If you'd rather talk it through now, call us."
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
