"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/** Animated count-up that runs once when scrolled into view. */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1500,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(value).toLocaleString("en-GB")}
      {suffix}
    </span>
  );
}
