import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "./Breadcrumbs";

/** Shared inner-page hero: navy gradient band with breadcrumb + title. */
export function PageHero({
  kicker,
  title,
  intro,
  breadcrumbs,
  children,
}: {
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumbs: { name: string; path: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 pt-[calc(var(--nav-h)+2.5rem)]">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_0%,#1f4f8f_0%,#12294f_45%,#0b1830_100%)]" />
        <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-elixa-cyan/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-elixa-green/15 blur-3xl" />
      </div>
      <Container className="relative pb-16">
        <Breadcrumbs items={breadcrumbs} />
        {kicker && <span className="kicker mt-6 block !text-elixa-green">{kicker}</span>}
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/75">{intro}</p>}
        {children}
      </Container>
    </section>
  );
}
