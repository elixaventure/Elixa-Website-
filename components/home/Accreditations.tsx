import { Container } from "@/components/ui/Container";
import { accreditations } from "@/content/site-content";

/**
 * Accreditations strip. Official certification marks are only shown once Elixa
 * confirms entitlement and supplies the assets (`supplied: true` + `asset`).
 * Until then we present the standards we work to as honest text — no fabricated
 * logos, numbers or memberships.
 */
export function Accreditations() {
  return (
    <section className="border-y border-navy/10 bg-white py-10">
      <Container>
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-navy/50">
            Working to recognised standards
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {accreditations.map((a) => (
              <li key={a.name} className="flex items-center gap-2">
                {a.supplied && a.asset ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.asset} alt={a.name} className="h-8 w-auto" />
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-3 py-1.5 text-sm font-semibold text-navy/70">
                    <span className="h-2 w-2 rounded-full bg-elixa-green" />
                    {a.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
