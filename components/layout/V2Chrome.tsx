"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isV2Route } from "@/lib/v2Routes";

/** The mirror of ClassicChrome: renders only on the rebuilt dark pages. */
export function V2Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (!isV2Route(pathname)) return null;
  return <>{children}</>;
}
