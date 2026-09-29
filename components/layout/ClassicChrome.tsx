"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isV2Route } from "@/lib/v2Routes";

/**
 * The classic (light) site chrome wraps every page EXCEPT the rebuilt dark
 * pages, which carry their own navigation and footer. The route list lives
 * in lib/v2Routes so this and the v2 chrome cannot drift apart.
 */
export function ClassicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isV2Route(pathname)) return null;
  return <>{children}</>;
}
