"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";
import { loadPlan, clearPlan } from "@/lib/planStore";

type Answers = {
  interests: string[];
  sector: "Home" | "Business" | "";
  postcode: string;
  // service-specific
  rooms: string;
  jobType: string;
  acMode: string;
  timeframe: string;
  // contact
  name: string;
  phone: string;
  email: string;
  contactPref: "Phone" | "Email" | "";
  message: string;
};

const initial: Answers = {
  interests: [],
  sector: "",
  postcode: "",
  rooms: "",
  jobType: "",
  acMode: "",
  timeframe: "",
  name: "",
  phone: "",
  email: "",
  contactPref: "",
  message: "",
};

const interestOptions = [
  ...services.map((s) => ({ key: s.slug, label: s.name })),
  { key: "multiple", label: "Multiple technologies" },
  { key: "advice", label: "Not sure / advice needed" },
];

export function QuoteWizard({ preselect = [] }: { preselect?: string[] }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(() => ({
    ...initial,
    interests: preselect.filter((slug) => services.some((s) => s.slug === slug)),
  }));
  const [planFile, setPlanFile] = useState<File | null>(null);

  // pick up a floor plan the visitor already uploaded in the Smart Energy Home
  useEffect(() => {
    loadPlan().then((f) => f && setPlanFile((cur) => cur ?? f));
  }, []);

  const wantsAc = a.interests.includes("air-conditioning");
  const totalSteps = 6;

  const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));
  const toggleInterest = (k: string) =>
    setA((prev) => ({
      ...prev,
      interests: prev.interests.includes(k)
        ? prev.interests.filter((x) => x !== k)
        : [...prev.interests, k],
    }));

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return a.interests.length > 0;
      case 1:
        return a.sector !== "";
      case 2:
        return a.postcode.trim().length >= 5;
      case 3:
        return true; // service-specific questions optional
      case 4:
        return (
          a.name.trim().length > 1 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) &&
          a.phone.trim().length >= 7 &&
          a.contactPref !== ""
        );
      default:
        return true;
    }
  }, [step, a]);

  const next = () => {
    if (step === 0) track("quote_start", { interests: a.interests.join(",") });
    track("quote_step", { step: step + 1 });
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const interestLabels = a.interests
      .map((k) => interestOptions.find((o) => o.key === k)?.label ?? k)
      .join(", ");
    track("quote_submit", { interests: a.interests.join(","), sector: a.sector });

    // Preferred: post to the configured inbox/CRM. Fallback: mailto.
    if (FORM_ENDPOINT) {
      const ok = await submitLead({
        name: a.name,
        phone: a.phone,
        email: a.email,
        interested_in: interestLabels,
        sector: a.sector,
        postcode: a.postcode,
        ac_rooms: wantsAc ? a.rooms : "",
        ac_job_type: wantsAc ? a.jobType : "",
        ac_mode: wantsAc ? a.acMode : "",
        timeframe: a.timeframe,
        preferred_contact: a.contactPref,
        message: a.message,
        source: "quote-wizard",
      }, planFile);
      if (ok) {
        clearPlan();
        setStep(totalSteps - 1);
        return;
      }
    }

    const lines = [
      `Interested in: ${interestLabels}`,
      `Home or business: ${a.sector}`,
      `Postcode: ${a.postcode}`,
      wantsAc ? `AC rooms: ${a.rooms || "—"}` : "",
      wantsAc ? `AC job type: ${a.jobType || "—"}` : "",
      wantsAc ? `AC mode: ${a.acMode || "—"}` : "",
      `Timeframe: ${a.timeframe || "—"}`,
      `Preferred contact: ${a.contactPref}`,
      "",
      a.message ? `Message: ${a.message}` : "",
      planFile ? `Floor plan: I have one — please attach "${planFile.name}" to this email before sending.` : "",
    ].filter(Boolean);
    const body = encodeURIComponent(`Name: ${a.name}\nPhone: ${a.phone}\nEmail: ${a.email}\n\n${lines.join("\n")}`);
    const subject = encodeURIComponent("Website quote request");
    window.location.href = `${site.emailHref}?subject=${subject}&body=${body}`;
    setStep(totalSteps - 1);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      {step < totalSteps - 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-navy/50">
            <span>
              Step {step + 1} of {totalSteps - 1}
            </span>
            <span>{Math.round(((step + 1) / (totalSteps - 1)) * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
            <motion.div
              className="h-full rounded-full bg-elixa-gradient"
              animate={{ width: `${((step + 1) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      <div className="rounded-4xl border border-navy/10 bg-white p-6 shadow-elevated sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <Step title="What are you interested in?" hint="Select all that apply.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {interestOptions.map((o) => (
                    <Choice
                      key={o.key}
                      label={o.label}
                      selected={a.interests.includes(o.key)}
                      onClick={() => toggleInterest(o.key)}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step title="Is this for a home or a business?">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(["Home", "Business"] as const).map((s) => (
                    <Choice key={s} label={s} big selected={a.sector === s} onClick={() => set({ sector: s })} />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step title="What's your postcode?" hint="So we can confirm coverage and grant eligibility.">
                <input
                  value={a.postcode}
                  onChange={(e) => set({ postcode: e.target.value.toUpperCase() })}
                  placeholder="E.g. E14 8PX"
                  className="w-full rounded-2xl border border-navy/15 bg-mist px-5 py-4 text-lg font-semibold uppercase tracking-wide text-navy focus:border-elixa-cyan focus:outline-none focus:ring-2 focus:ring-elixa-cyan/30"
                  autoComplete="postal-code"
                />
              </Step>
            )}

            {step === 3 && (
              <Step
                title={wantsAc ? "A few details about your air conditioning" : "A few quick details"}
                hint="Optional — but it helps us prepare."
              >
                {wantsAc && (
                  <div className="space-y-5">
                    <Select label="How many rooms?" value={a.rooms} onChange={(v) => set({ rooms: v })} options={["1", "2", "3", "4", "5+"]} />
                    <Select label="New installation or replacement?" value={a.jobType} onChange={(v) => set({ jobType: v })} options={["New installation", "Replacement"]} />
                    <Select label="Cooling only, or heating & cooling?" value={a.acMode} onChange={(v) => set({ acMode: v })} options={["Cooling only", "Heating & cooling"]} />
                  </div>
                )}
                <div className={wantsAc ? "mt-5" : ""}>
                  <Select
                    label="Approximate timeframe?"
                    value={a.timeframe}
                    onChange={(v) => set({ timeframe: v })}
                    options={["As soon as possible", "1–3 months", "3–6 months", "Just researching"]}
                  />
                </div>
                <textarea
                  value={a.message}
                  onChange={(e) => set({ message: e.target.value })}
                  rows={3}
                  placeholder="Anything else you'd like us to know? (optional)"
                  className="mt-5 w-full rounded-2xl border border-navy/15 bg-mist px-4 py-3 text-navy focus:border-elixa-cyan focus:outline-none focus:ring-2 focus:ring-elixa-cyan/30"
                />

                {/* optional floor plan — travels with the lead to the survey team */}
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-navy">Got a floor plan? (optional)</p>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-navy/25 bg-mist px-4 py-3 text-sm text-navy/70 transition-colors hover:border-elixa-cyan">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-elixa-cyan" fill="none" aria-hidden="true">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="flex-1 truncate">
                      {planFile ? planFile.name : "Upload a floor plan or sketch — PDF or photo, up to 10 MB"}
                    </span>
                    {planFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setPlanFile(null);
                          clearPlan();
                        }}
                        className="flex-none font-semibold text-navy/40 hover:text-navy"
                        aria-label="Remove file"
                      >
                        ✕
                      </button>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (f && f.size > 10 * 1024 * 1024) {
                          alert("That file is over 10 MB — please choose a smaller file or a photo.");
                          return;
                        }
                        setPlanFile(f);
                      }}
                    />
                  </label>
                  <p className="mt-1.5 text-xs text-navy/45">
                    It helps our surveyors size your system before we visit.
                  </p>
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step title="How can we reach you?" hint="No spam — just your quote.">
                <div className="grid gap-3">
                  <input value={a.name} onChange={(e) => set({ name: e.target.value })} placeholder="Full name" autoComplete="name" className={inputCls} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={a.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="Telephone" autoComplete="tel" className={inputCls} />
                    <input value={a.email} onChange={(e) => set({ email: e.target.value })} placeholder="Email" type="email" autoComplete="email" className={inputCls} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-navy">Preferred contact method</p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {(["Phone", "Email"] as const).map((c) => (
                        <Choice key={c} label={c} selected={a.contactPref === c} onClick={() => set({ contactPref: c })} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-navy/45">
                    By submitting you agree to be contacted about your enquiry. See our Privacy Policy.
                  </p>
                </div>
              </Step>
            )}

            {step === 5 && (
              <div className="py-6 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-elixa-gradient text-white">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2 className="mt-6 text-2xl font-extrabold text-navy">Thank you — an Elixa specialist will be in touch.</h2>
                <p className="mx-auto mt-3 max-w-md text-navy/60">
                  Your details are on their way. If your email app didn&apos;t open, call us on{" "}
                  <a href={site.phoneHref} className="font-semibold text-elixa-cyan">
                    {site.phoneDisplay}
                  </a>
                  .
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {step < totalSteps - 1 && (
          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={back}
              disabled={step === 0}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                step === 0 ? "invisible" : "text-navy/60 hover:bg-navy/5"
              )}
            >
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={next} disabled={!canNext} className="btn-primary btn-lg disabled:cursor-not-allowed disabled:opacity-40">
                Continue
              </button>
            ) : (
              <button onClick={submit} disabled={!canNext} className="btn-primary btn-lg disabled:cursor-not-allowed disabled:opacity-40">
                Send my request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-navy/15 bg-mist px-4 py-3 text-navy focus:border-elixa-cyan focus:outline-none focus:ring-2 focus:ring-elixa-cyan/30";

function Step({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-navy">{title}</h2>
      {hint && <p className="mt-1.5 text-sm text-navy/55">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({
  label,
  selected,
  onClick,
  big,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  big?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-between gap-2 rounded-2xl border px-4 text-left font-semibold transition-all",
        big ? "py-5 text-lg" : "py-3.5 text-sm",
        selected
          ? "border-elixa-cyan bg-elixa-gradient-soft text-navy ring-2 ring-elixa-cyan/30"
          : "border-navy/15 text-navy/75 hover:border-navy/40"
      )}
    >
      {label}
      <span
        className={cn(
          "grid h-5 w-5 flex-none place-items-center rounded-full border",
          selected ? "border-elixa-cyan bg-elixa-cyan text-white" : "border-navy/25"
        )}
      >
        {selected && (
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
            <path d="M4 10l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-navy">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
              value === o ? "border-navy bg-navy text-white" : "border-navy/15 text-navy/70 hover:border-navy/40"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
