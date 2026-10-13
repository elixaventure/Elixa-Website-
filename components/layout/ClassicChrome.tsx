"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { hasOwnChrome } from "@/lib/v2Routes";

/**
 * The classic (light) site chrome wraps every page EXCEPT the rebuilt dark
 * pages, which carry their own navigation and footer, and the bare landing
 * pages, which deliberately have none. Both lists live in lib/v2Routes so
 * this and the v2 chrome cannot drift apart.
 */
export function ClassicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (hasOwnChrome(pathname)) return null;
  return <>{children}</>;
}
