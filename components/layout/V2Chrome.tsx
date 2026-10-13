"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isBareRoute, isV2Route } from "@/lib/v2Routes";

/**
 * The mirror of ClassicChrome: renders only on the rebuilt dark pages, and
 * not on a bare landing page, which is meant to have nothing to leave by.
 */
export function V2Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (!isV2Route(pathname) || isBareRoute(pathname)) return null;
  return <>{children}</>;
}
