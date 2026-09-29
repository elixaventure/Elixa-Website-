import type { Metadata } from "next";
import { site } from "@/content/site";

const titleTemplate = (t?: string) =>
  t ? `${t} | ${site.name}` : `${site.name} — ${site.tagline}`;

/** Build page metadata with sensible OpenGraph/Twitter defaults. */
export function pageMeta(opts: {
  title?: string;
  description?: string;
  path?: string;
  /** Pass a fully-formed title (already includes brand) to skip templating. */
  rawTitle?: string;
}): Metadata {
  const url = `${site.url}${opts.path ?? ""}`;
  const title = opts.rawTitle ?? titleTemplate(opts.title);
  const description = opts.description ?? site.description;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title,
      description,
      locale: "en_GB",
      images: [{ url: `${site.url}/og.png`, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${site.url}/og.png`],
    },
  };
}

/* ---------- JSON-LD schema builders ---------- */

/**
 * Stable @id values. Every schema block points at these rather than
 * repeating the business details, so a crawler — or an AI assistant reading
 * the page — resolves one organisation with many services rather than a pile
 * of unrelated fragments. This is the bit that makes the markup worth having.
 */
export const ORG_ID = `${site.url}/#organization`;
export const BUSINESS_ID = `${site.url}/#business`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * Only real profiles. site.social carries bare domains as placeholders until
 * the accounts exist, and pointing sameAs at facebook.com's front page is
 * worse than omitting it — these are identity claims, not links.
 */
function realSocials(): string[] {
  return Object.values(site.social).filter((u) => {
    try {
      return new URL(u).pathname.replace(/\/+$/, "").length > 0;
    } catch {
      return false;
    }
  });
}

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: `${site.address.line1}, ${site.address.line2}`,
  addressLocality: site.address.city,
  postalCode: site.address.postcode,
  addressCountry: "GB",
};

export function organizationSchema() {
  const sameAs = realSocials();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: `${site.url}/brand/elixa-logo-2.png`,
    email: site.email,
    telephone: site.phoneHref.replace("tel:", ""),
    address: postalAddress,
    areaServed: site.areaServed,
    slogan: site.tagline,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function localBusinessSchema() {
  const sameAs = realSocials();
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HVACBusiness"],
    "@id": BUSINESS_ID,
    name: site.legalName,
    parentOrganization: { "@id": ORG_ID },
    url: site.url,
    image: `${site.url}/og.png`,
    logo: `${site.url}/brand/elixa-logo-2.png`,
    // E.164, which is what every consumer of this expects.
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    priceRange: "££",
    currenciesAccepted: "GBP",
    address: postalAddress,
    areaServed: { "@type": "Country", name: "United Kingdom" },
    knowsAbout: [
      "Air source heat pumps",
      "Solar PV",
      "Battery storage",
      "ThermaSkirt heated skirting",
      "Underfloor heating",
      "Air conditioning",
      "EV charging",
      "Boiler Upgrade Scheme",
    ],
    ...(sameAs.length ? { sameAs } : {}),
    // NOTE: deliberately no aggregateRating or review. Those must describe
    // real, verifiable reviews; inventing them is both dishonest and against
    // Google's structured data policy. Wire them up from a genuine review
    // source when one exists.
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-GB",
  };
}

export function serviceSchema(s: {
  name: string;
  description: string;
  slug: string;
  /** what the service is applied to, e.g. "Residential property" */
  audience?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/${s.slug}#service`,
    serviceType: s.name,
    name: s.name,
    description: s.description,
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    url: `${site.url}/${s.slug}`,
    ...(s.audience ? { audience: { "@type": "Audience", audienceType: s.audience } } : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}

/**
 * Everything one inner page needs, in one call. Nulls are dropped so a page
 * without FAQs simply emits fewer blocks.
 */
export function pageSchema(opts: {
  name: string;
  description: string;
  slug: string;
  faqs?: { q: string; a: string }[];
  audience?: string;
}) {
  return [
    serviceSchema({
      name: opts.name,
      description: opts.description,
      slug: opts.slug,
      audience: opts.audience,
    }),
    opts.faqs ? faqSchema(opts.faqs) : null,
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: opts.name, path: `/${opts.slug}` },
    ]),
  ].filter(Boolean) as object[];
}

export function caseStudySchema(cs: {
  slug: string;
  title: string;
  standfirst: string;
  cover: { src: string };
  kind: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${site.url}/case-studies/${cs.slug}#article`,
    headline: cs.title,
    description: cs.standfirst,
    image: `${site.url}${cs.cover.src}`,
    articleSection: cs.kind,
    url: `${site.url}/case-studies/${cs.slug}`,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en-GB",
    // No datePublished: we do not have real publication dates for these, and
    // a guessed one is a claim we cannot stand behind.
  };
}

export function caseStudyIndexSchema(items: { slug: string; title: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Elixa Renewables case studies",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${site.url}/case-studies/${c.slug}`,
    })),
  };
}
