import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function SectionHeading({
  kicker,
  title,
  intro,
  align = "center",
  theme = "light",
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  theme?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {kicker && (
        <Reveal>
          <span className="kicker">{kicker}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={cn(
            "mt-3 text-3xl font-extrabold sm:text-4xl lg:text-[2.7rem]",
            theme === "dark" && "text-white"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "mt-4 text-base leading-relaxed sm:text-lg",
              theme === "dark" ? "text-white/70" : "text-navy/60"
            )}
          >
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
