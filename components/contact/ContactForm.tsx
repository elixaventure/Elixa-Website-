"use client";

import { useState } from "react";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { submitLead, FORM_ENDPOINT } from "@/lib/forms";

const inputCls =
  "w-full rounded-2xl border border-navy/15 bg-mist px-4 py-3 text-navy focus:border-elixa-cyan focus:outline-none focus:ring-2 focus:ring-elixa-cyan/30";

export function ContactForm() {
  const [note, setNote] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote({ type: "err", msg: "Please add your name and a valid email." });
      return;
    }
    const payload = {
      name,
      email,
      phone: String(f.get("phone") || ""),
      service: String(f.get("service") || ""),
      message: String(f.get("message") || ""),
      source: "contact-form",
    };
    track("email_click", { location: "contact-form" });

    // Preferred: post to the configured inbox/CRM. Fallback: mailto.
    if (FORM_ENDPOINT && (await submitLead(payload))) {
      setNote({ type: "ok", msg: "Thank you — your enquiry has been sent. We'll be in touch shortly." });
      form.reset();
      return;
    }
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${payload.phone || "—"}\nInterested in: ${payload.service}\n\n${payload.message}`
    );
    window.location.href = `${site.emailHref}?subject=${encodeURIComponent("Website enquiry")}&body=${body}`;
    setNote({ type: "ok", msg: "Thanks! Your email app should open with the details ready to send." });
    form.reset();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-4xl border border-navy/10 bg-white p-6 shadow-elevated sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-navy">
          Name
          <input name="name" className={inputCls} autoComplete="name" required />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-navy">
          Email
          <input name="email" type="email" className={inputCls} autoComplete="email" required />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-navy">
          Phone <span className="font-normal text-navy/40">(optional)</span>
          <input name="phone" className={inputCls} autoComplete="tel" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-navy">
          Interested in
          <select name="service" className={inputCls} defaultValue="Not sure — advice needed">
            {services.map((s) => (
              <option key={s.slug}>{s.name}</option>
            ))}
            <option>Multiple technologies</option>
            <option>Not sure — advice needed</option>
          </select>
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-semibold text-navy">
        Message
        <textarea name="message" rows={4} className={inputCls} placeholder="Tell us about your property and what you'd like to achieve…" />
      </label>
      <button type="submit" className="btn-primary btn-lg w-full">
        Send enquiry
      </button>
      {note && (
        <p role="status" className={`text-center text-sm font-semibold ${note.type === "ok" ? "text-elixa-green" : "text-red-500"}`}>
          {note.msg}
        </p>
      )}
    </form>
  );
}
