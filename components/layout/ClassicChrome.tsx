"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The classic (light) site chrome wraps every page EXCEPT the rebuilt dark
 * pages, which carry their own navigation and footer. As inner pages are
 * rebuilt to the new design, add their routes here.
 */
const V2_ROUTES = new Set([
  "/",
  "/air-source-heat-pumps",
  "/solar-pv",
  "/thermaskirt",
  "/underfloor-heating",
  "/battery-storage",
  "/ev-charging",
  "/air-conditioning",
  "/projects",
  "/case-studies",
  "/grants-funding",
  "/about",
  "/contact",
  "/quote",
]);

export function ClassicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const path = pathname?.replace(/\/$/, "") || "/";
  if (V2_ROUTES.has(path) || pathname === "/" || path.startsWith("/case-studies/")) return null;
  return <>{children}</>;
}
