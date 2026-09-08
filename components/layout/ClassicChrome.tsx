"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The classic (light) site chrome wraps every page EXCEPT the rebuilt dark
 * pages, which carry their own navigation and footer. As inner pages are
 * rebuilt to the new design, add their routes here.
 */
const V2_ROUTES = new Set(["/", "/air-source-heat-pumps"]);

export function ClassicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (V2_ROUTES.has(pathname?.replace(/\/$/, "") || "/") || pathname === "/") return null;
  return <>{children}</>;
}
