"use client";

import { useState } from "react";
import { QuoteWizard } from "./QuoteWizard";

/** Reads ?service=slug (client-side, static-export friendly) to preselect. */
export function QuoteLauncher() {
  const [preselect] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const p = new URLSearchParams(window.location.search).get("service");
    return p ?? undefined;
  });
  return <QuoteWizard preselect={preselect} />;
}
