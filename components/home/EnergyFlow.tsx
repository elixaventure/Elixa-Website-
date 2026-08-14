"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const NODES = [
  { key: "sun", label: "Sun", icon: "☀" },
  { key: "solar", label: "Solar PV", icon: "▦" },
  { key: "battery", label: "Battery", icon: "▮" },
  { key: "home", label: "Your Home", icon: "⌂" },
  { key: "climate", label: "Heating & Cooling", icon: "❄" },
  { key: "ev", label: "EV", icon: "⚡" },
];

/**
 * Scroll-driven energy journey: SUN → SOLAR → BATTERY → HOME → HEATING/COOLING → EV.
 * A gradient line "fills" and energy pulses travel along it as the section scrolls.
 */
export function EnergyFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 40%"],
  });
  const dashOffset = useTransform(scrollYProgress, [0, 1], [1000, 0]);

  return (
    <section ref={ref} className="bg-navy-900 py-24 text-white sm:py-28">
      <Container>
        <SectionHeading
          theme="dark"
          kicker="One integrated ecosystem"
          title="Energy that works together."
          intro="Generate it, store it, and use it to heat, cool and move — Elixa technologies connect into one intelligent system."
        />

        <div className="relative mt-16">
          {/* connecting line */}
          <svg
            className="absolute left-0 right-0 top-[38px] hidden h-2 w-full md:block"
            viewBox="0 0 1000 8"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="4" x2="1000" y2="4" stroke="rgba(255,255,255,.14)" strokeWidth="2" />
            <motion.line
              x1="0"
              y1="4"
              x2="1000"
              y2="4"
              stroke="url(#flowgrad)"
              strokeWidth="3"
              strokeDasharray="1000"
              style={{ strokeDashoffset: reduce ? 0 : dashOffset }}
            />
            <defs>
              <linearGradient id="flowgrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6ABF4B" />
                <stop offset="1" stopColor="#1D9ED9" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
            {NODES.map((n, i) => (
              <motion.li
                key={n.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <span className="grid h-[76px] w-[76px] place-items-center rounded-2xl border border-white/15 bg-white/5 text-2xl backdrop-blur">
                  <span className="text-gradient font-bold">{n.icon}</span>
                </span>
                <span className="mt-3 font-display text-sm font-semibold">{n.label}</span>
                {i < NODES.length - 1 && (
                  <span className="absolute -right-3 top-9 text-white/30 md:hidden">→</span>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
