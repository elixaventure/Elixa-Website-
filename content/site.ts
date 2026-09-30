/**
 * Global site configuration — single source of truth for NAP (name, address,
 * phone), CTAs and nav. Edit here (or wire to a headless CMS) to update sitewide.
 */

export const site = {
  name: "Elixa Renewables Group",
  legalName: "Elixa Renewables Group Ltd",
  tagline: "Powering a Smarter, Greener Future.",
  description:
    "Premium renewable energy, heating, cooling and low-carbon technology — expertly supplied and installed nationwide across the UK.",
  url: "https://elixarenewables.co.uk",
  // Update per deployment (used for canonical URLs & sitemap); no trailing slash.
  phone: "07833 387653",
  phoneHref: "tel:+447833387653",
  phoneDisplay: "07833 387653",
  email: "info@elixarenewables.co.uk",
  emailHref: "mailto:info@elixarenewables.co.uk",
  address: {
    line1: "14/2E Docklands Business Centre",
    line2: "10–16 Tiller Road",
    city: "London",
    postcode: "E14 8PX",
    country: "United Kingdom",
  },
  areaServed: "United Kingdom",
  /**
   * The Google review link, from Google Business Profile's own "ask for
   * reviews" tool, or built by hand as
   * https://search.google.com/local/writereview?placeid=<PLACE_ID>
   *
   * Empty until the real one is pasted in. Everything that uses it renders
   * nothing while it is empty — a "review us" link that goes nowhere, or
   * worse to somebody else's listing, is worse than no link.
   */
  googleReviewUrl: "https://maps.app.goo.gl/etucww9ZwYzLxBt59",
  /**
   * Accreditations exactly as Elixa publish them on their own marketing —
   * nothing here is inferred. Rendered as a quiet line in the footer rather
   * than as third-party logos, whose brand colours fight the dark palette.
   */
  accreditations: [
    "MCS Partner",
    "Gas Safe Registered",
    "SafeContractor Approved",
    "ThermaSkirt Accredited Installer",
  ],
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    linkedin: "https://www.linkedin.com/",
  },
} as const;

export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: "Solar", href: "/solar-pv" },
  { label: "Battery", href: "/battery-storage" },
  { label: "Heat Pumps", href: "/air-source-heat-pumps" },
  { label: "Air Conditioning", href: "/air-conditioning" },
  { label: "Heating", href: "/underfloor-heating" },
  { label: "EV Charging", href: "/ev-charging" },
  { label: "Grants & Funding", href: "/grants-funding" },
  { label: "Projects", href: "/projects" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Solutions",
    items: [
      { label: "Solar PV", href: "/solar-pv" },
      { label: "Battery Storage", href: "/battery-storage" },
      { label: "Air Source Heat Pumps", href: "/air-source-heat-pumps" },
      { label: "Air Conditioning", href: "/air-conditioning" },
      { label: "ThermaSkirt Heating", href: "/thermaskirt" },
      { label: "Underfloor Heating", href: "/underfloor-heating" },
      { label: "EV Charging", href: "/ev-charging" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Smart Energy Home", href: "/smart-energy-home" },
      { label: "About Elixa", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Grants & Funding", href: "/grants-funding" },
      { label: "Quick Heat Pump Quote", href: "/quick-quote" },
      { label: "Get a Quote", href: "/quote" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Photo Permission", href: "/photo-permission" },
];
