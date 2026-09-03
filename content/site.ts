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
  url: "https://www.elixarenewables.co.uk",
  // Update per deployment (used for canonical URLs & sitemap); no trailing slash.
  phone: "0333 0151 246",
  phoneHref: "tel:+443330151246",
  phoneDisplay: "0333 0151 246",
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
      { label: "Grants & Funding", href: "/grants-funding" },
      { label: "Get a Quote", href: "/quote" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];
