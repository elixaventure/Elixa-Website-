"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * The classic (light) site chrome wraps every page EXCEPT the rebuilt dark
 * homepage, which carries its own navigation and footer. As inner pages are
 * rebuilt to the new design they migrate off this wrapper too.
 */
export function ClassicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
