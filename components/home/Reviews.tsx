import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/content/site-content";

/**
 * Testimonials. Renders genuine reviews when present; otherwise shows a tasteful
 * "ready for your reviews" state. We never fabricate testimonials — populate
 * `testimonials` with consented quotes or wire a Google/Trustpilot integration.
 */
export function Reviews() {
  return (
    <section className="bg-mist py-24 sm:py-28">
      <Container>
        <SectionHeading
          kicker="What customers say"
          title="Trusted by homeowners & businesses."
          intro="Real feedback from real Elixa installations."
        />

        {testimonials.length > 0 ? (
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-3xl border border-navy/10 bg-white p-7 shadow-card">
                <div className="text-elixa-green" aria-hidden>★★★★★</div>
                <blockquote className="mt-4 text-navy/80">“{t.quote}”</blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-navy">
                  {t.author}
                  <span className="block font-normal text-navy/50">
                    {t.location} · {t.service}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border border-dashed border-navy/20 bg-white p-10 text-center">
            <p className="font-display text-lg font-bold text-navy">
              Genuine customer reviews coming soon.
            </p>
            <p className="mt-2 text-sm text-navy/60">
              This space is ready for verified testimonials and Google/Trustpilot ratings.
              Just say the word and we&apos;ll wire them in.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
