import { Container } from "@/components/ui/Container";
import { PageHero } from "./PageHero";
import { site } from "@/content/site";

/**
 * Legal page shell. The body text here is a STRUCTURAL PLACEHOLDER only — Elixa
 * must supply final, legally-reviewed Privacy, Cookie and Terms copy before
 * publication. See README "Before you publish".
 */
export function LegalPage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero
        kicker="Legal"
        title={title}
        intro={intro}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="mb-8 rounded-2xl border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Placeholder:</strong> This page contains outline text only. {site.legalName} should
            replace it with final, legally-reviewed content before going live.
          </div>
          <div className="prose-elixa space-y-5 text-navy/75">{children}</div>
        </Container>
      </section>
    </>
  );
}
