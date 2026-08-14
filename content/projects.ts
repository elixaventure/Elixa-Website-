/**
 * Project / case-study content (CMS-ready). These are clearly-labelled
 * illustrative placeholders so the Projects UI is fully functional. Replace
 * with genuine Elixa installations and photography before publication.
 */

export type ProjectCategory =
  | "Solar"
  | "Battery"
  | "Heat Pumps"
  | "Air Conditioning"
  | "Heating"
  | "EV Charging"
  | "Commercial";

export interface Project {
  slug: string;
  title: string;
  categories: ProjectCategory[];
  location: string;
  propertyType: string;
  requirement: string;
  challenge: string;
  solution: string;
  outcome: string;
  image: string;
  placeholder: true;
}

export const projectCategories: ProjectCategory[] = [
  "Solar",
  "Battery",
  "Heat Pumps",
  "Air Conditioning",
  "Heating",
  "EV Charging",
  "Commercial",
];

export const projects: Project[] = [
  {
    slug: "victorian-terrace-solar-battery",
    title: "Solar & battery for a period terrace",
    categories: ["Solar", "Battery"],
    location: "London",
    propertyType: "Victorian terrace",
    requirement: "Cut rising electricity bills without altering the home's character.",
    challenge: "A complex roofline and conservation-sensitive frontage.",
    solution: "A discreet rear-roof solar array paired with a home battery and app monitoring.",
    outcome: "Significant reduction in grid electricity, with evening usage running on stored solar.",
    image: "/images/projects/placeholder-1.svg",
    placeholder: true,
  },
  {
    slug: "new-build-heat-pump-ufh",
    title: "Heat pump & underfloor heating, new build",
    categories: ["Heat Pumps", "Heating"],
    location: "Home Counties",
    propertyType: "Detached new build",
    requirement: "A fully low-carbon heating system from day one.",
    challenge: "Delivering even comfort across an open-plan layout.",
    solution: "An air source heat pump designed around whole-home heat loss, feeding zoned underfloor heating.",
    outcome: "Consistent, efficient warmth at low flow temperatures throughout the property.",
    image: "/images/projects/placeholder-2.svg",
    placeholder: true,
  },
  {
    slug: "office-air-conditioning-multisplit",
    title: "Multi-split air conditioning for offices",
    categories: ["Air Conditioning", "Commercial"],
    location: "London",
    propertyType: "Commercial office suite",
    requirement: "Year-round comfort for a busy workspace.",
    challenge: "Cooling in summer and heating in shoulder seasons, with minimal disruption.",
    solution: "A multi-split system installed by qualified F-Gas engineers, zoned per area.",
    outcome: "One system delivering both cooling and heating across the floor.",
    image: "/images/projects/placeholder-3.svg",
    placeholder: true,
  },
  {
    slug: "retrofit-thermaskirt-renovation",
    title: "ThermaSkirt in a full renovation",
    categories: ["Heating"],
    location: "South East",
    propertyType: "Renovated semi-detached",
    requirement: "Remove bulky radiators without lifting floors.",
    challenge: "Retaining wall space while keeping flow temperatures low.",
    solution: "ThermaSkirt heated skirting throughout, matched to the home's heat source.",
    outcome: "Even warmth from the room perimeter and freed-up walls.",
    image: "/images/projects/placeholder-4.svg",
    placeholder: true,
  },
  {
    slug: "home-ev-solar-integration",
    title: "Solar-integrated home EV charging",
    categories: ["EV Charging", "Solar"],
    location: "London",
    propertyType: "Detached family home",
    requirement: "Charge the family EV as cheaply and cleanly as possible.",
    challenge: "Coordinating charging with solar generation and off-peak tariffs.",
    solution: "A smart charger integrated with the existing solar and battery system.",
    outcome: "The car tops up on solar by day and cheap off-peak power overnight.",
    image: "/images/projects/placeholder-5.svg",
    placeholder: true,
  },
  {
    slug: "commercial-rooftop-solar",
    title: "Commercial rooftop solar array",
    categories: ["Solar", "Commercial"],
    location: "Nationwide",
    propertyType: "Warehouse / light industrial",
    requirement: "Reduce operating costs and carbon across a large roof.",
    challenge: "Maximising yield around rooflights and plant.",
    solution: "A large-format array with commercial monitoring and export management.",
    outcome: "Substantial on-site generation offsetting daytime demand.",
    image: "/images/projects/placeholder-6.svg",
    placeholder: true,
  },
];
