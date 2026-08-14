"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, projectCategories, type ProjectCategory } from "@/content/projects";
import { cn } from "@/lib/cn";

export function ProjectsGallery() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const shown =
    filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["All", ...projectCategories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              filter === c
                ? "border-transparent bg-navy text-white"
                : "border-navy/15 text-navy/70 hover:border-navy/40"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.article
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="group overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-elixa-gradient-soft">
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_120%_at_30%_0%,#1f4f8f,#12294f)]">
                  <span className="font-display text-sm font-semibold text-white/70">
                    Project photography
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-navy">
                  Placeholder
                </span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-1.5">
                  {p.categories.map((c) => (
                    <span key={c} className="rounded-full bg-navy/5 px-2.5 py-0.5 text-xs font-semibold text-navy/70">
                      {c}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-navy/50">
                  {p.propertyType} · {p.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy/65">{p.solution}</p>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
