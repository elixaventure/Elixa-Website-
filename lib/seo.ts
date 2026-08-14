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

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.postcode,
      addressCountry: "GB",
    },
    areaServed: site.areaServed,
    slogan: site.tagline,
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.legalName,
    url: site.url,
    image: `${site.url}/og.png`,
    telephone: site.phone,
    email: site.email,
    priceRange: "££",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.postcode,
      addressCountry: "GB",
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}

export function serviceSchema(s: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.name,
    name: s.name,
    description: s.description,
    provider: { "@type": "Organization", name: site.legalName, url: site.url },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    url: `${site.url}/${s.slug}`,
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
