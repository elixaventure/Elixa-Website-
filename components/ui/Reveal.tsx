"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/** Scroll-triggered fade/rise. Respects reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "span" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={cn(className)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
