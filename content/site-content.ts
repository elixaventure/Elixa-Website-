/**
 * Editorial content blocks used across the site (CMS-ready).
 * NOTE: Accreditations, testimonials and funding figures below are placeholders
 * or structural stubs. Elixa must confirm/supply authorised assets and copy
 * before publication — see README "Before you publish".
 */

export interface Accreditation {
  name: string;
  note: string;
  /** Path to official supplied logo; null until Elixa provides the asset. */
  asset: string | null;
  supplied: boolean;
}

// Structural placeholders — display only once Elixa confirms entitlement and
// supplies the official marks. `supplied: false` keeps them out of production UI.
export const accreditations: Accreditation[] = [
  { name: "MCS", note: "MCS-standard installations", asset: null, supplied: false },
  { name: "Gas Safe Register", note: "Gas Safe registered", asset: null, supplied: false },
  { name: "SafeContractor", note: "SafeContractor approved", asset: null, supplied: false },
  { name: "F-Gas", note: "Fully qualified F-Gas engineers", asset: null, supplied: false },
  { name: "ThermaSkirt", note: "Accredited installer", asset: null, supplied: false },
];

export interface ProcessStep {
  no: string;
  title: string;
  body: string;
}

export const processSteps: ProcessStep[] = [
  { no: "01", title: "Consult", body: "Tell us about your property and requirements. We listen first, then advise honestly." },
  { no: "02", title: "Design", body: "Our engineers design the right energy, heating or cooling solution for your building." },
  { no: "03", title: "Install", body: "Professional installation by appropriately qualified specialists, cleanly and on schedule." },
  { no: "04", title: "Support", body: "Commissioning, handover and ongoing support to keep your system performing." },
];

export interface WhyPoint {
  title: string;
  body: string;
}

export const whyElixa: WhyPoint[] = [
  { title: "Nationwide installers", body: "A single, capable partner delivering premium installations across the UK." },
  { title: "Renewable energy specialists", body: "Solar, storage and low-carbon technology are our core expertise, not a sideline." },
  { title: "Heating & cooling expertise", body: "From heat pumps to air conditioning, we cover complete climate control." },
  { title: "Fully qualified F-Gas engineers", body: "Refrigerant work carried out correctly, safely and to standard." },
  { title: "Professional surveys", body: "Proper heat-loss and system design — no guesswork, no oversell." },
  { title: "End-to-end project management", body: "One accountable team from first survey to final handover." },
  { title: "Premium equipment", body: "Quality components specified to perform and to last." },
  { title: "Aftercare & support", body: "We're here after the install, not just on the day of it." },
];

export interface Testimonial {
  quote: string;
  author: string;
  location: string;
  service: string;
}

// Intentionally empty — do NOT fabricate reviews. Populate with genuine,
// consented customer testimonials (or wire a Google/Trustpilot integration).
export const testimonials: Testimonial[] = [];

export interface Grant {
  name: string;
  body: string;
  status: "active" | "check";
}

// Editable funding blocks. Do NOT hard-code specific grant amounts as permanent
// copy — keep figures in the CMS and review regularly against scheme rules.
export const grants: Grant[] = [
  {
    name: "Boiler Upgrade Scheme",
    body: "Government support may be available toward the cost of an air source heat pump for eligible properties in England and Wales.",
    status: "check",
  },
  {
    name: "Local authority & other schemes",
    body: "Additional government, local-authority or funding options may apply depending on your circumstances, technology, property and location.",
    status: "check",
  },
  {
    name: "Finance options",
    body: "Spread the cost of your project with finance options where available and appropriate.",
    status: "check",
  },
];

export const grantsDisclaimer =
  "Funding and grants are subject to eligibility, scheme rules and availability. Elixa does not guarantee funding. Figures and schemes change — always confirm current details with us and the relevant scheme.";
