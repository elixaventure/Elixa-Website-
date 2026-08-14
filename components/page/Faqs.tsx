import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Faq } from "@/content/services";

/** Accessible FAQ list using native <details> — no JS required. */
export function Faqs({ faqs }: { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="bg-mist py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading kicker="Good to know" title="Frequently asked questions" align="left" />
        <div className="mt-10 divide-y divide-navy/10">
          {faqs.map((f, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-navy">
                {f.q}
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-navy/15 text-navy transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-navy/70">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
