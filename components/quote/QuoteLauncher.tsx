"use client";

import { useState } from "react";
import { QuoteWizard } from "./QuoteWizard";

/**
 * Reads the preselection from the URL (client-side, static-export friendly):
 * - ?service=slug           → single service
 * - ?tech=slug1,slug2,...    → multiple (from the Smart Energy Home builder)
 */
export function QuoteLauncher() {
  const [preselect] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const q = new URLSearchParams(window.location.search);
    const tech = q.get("tech");
    if (tech) return tech.split(",").map((s) => s.trim()).filter(Boolean);
    const service = q.get("service");
    return service ? [service] : [];
  });
  return <QuoteWizard preselect={preselect} />;
}
