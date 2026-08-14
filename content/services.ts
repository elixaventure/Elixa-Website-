/**
 * Service content model — drives the nav, homepage grid, 3D-home hotspots and
 * every service page. This is the CMS seam: replace these objects with a fetch
 * from a headless CMS (Sanity/Contentful/Payload) and the UI is unchanged.
 */

export type IconKey =
  | "solar"
  | "battery"
  | "heatpump"
  | "aircon"
  | "thermaskirt"
  | "underfloor"
  | "ev";

export interface Faq {
  q: string;
  a: string;
}

export interface ServiceHighlight {
  title: string;
  body: string;
}

export interface Service {
  slug: string;
  name: string;
  navLabel: string;
  icon: IconKey;
  /** Short one-liner for cards & hotspots. */
  summary: string;
  headline: string;
  subhead: string;
  seoTitle: string;
  seoDescription: string;
  /** Placeholder hero image path — replace with authorised photography. */
  heroImage: string;
  intro: string[];
  capabilities: string[];
  highlights: ServiceHighlight[];
  integrations: string[];
  faqs: Faq[];
  ctaLabel: string;
}

export const services: Service[] = [
  {
    slug: "solar-pv",
    name: "Solar PV",
    navLabel: "Solar",
    icon: "solar",
    summary: "Generate clean electricity from your own roof.",
    headline: "Generate clean electricity from your own roof.",
    subhead:
      "High-efficiency solar PV, designed and installed for UK homes and businesses — and built to integrate with battery storage, EV charging and heat pumps.",
    seoTitle: "Solar PV Installation | Residential & Commercial Solar Panels | Elixa",
    seoDescription:
      "Premium solar panel installation across the UK. System design, inverters, monitoring and integration with battery storage, EV charging and heat pumps.",
    heroImage: "/images/services/solar.svg",
    intro: [
      "Solar PV turns daylight into free, low-carbon electricity — reducing your reliance on the grid and insulating you from rising energy prices.",
      "Every Elixa system is individually designed around your roof, your usage and your goals, then installed cleanly by experienced teams.",
    ],
    capabilities: [
      "Residential solar PV",
      "Commercial & agricultural solar",
      "Bespoke system design & sizing",
      "String & hybrid inverters",
      "Smart generation monitoring",
      "Bird & pigeon proofing",
      "Roof, flat-roof & ground-mount",
      "MCS-standard installation",
    ],
    highlights: [
      {
        title: "Designed around you",
        body: "We model your roof, shading and consumption to size a system that pays back — not one that simply fills the roof.",
      },
      {
        title: "Built to expand",
        body: "Every install is battery-ready and EV-ready, so you can add storage and charging whenever you're ready.",
      },
      {
        title: "See every kWh",
        body: "App-based monitoring shows what you generate, use and export — in real time, from anywhere.",
      },
    ],
    integrations: ["battery-storage", "ev-charging", "air-source-heat-pumps"],
    faqs: [
      {
        q: "Will solar work on a typical UK roof?",
        a: "Most UK roofs are suitable. South-facing is ideal, but east/west arrays perform well and often better match daily usage. We assess orientation, pitch and shading during your free survey.",
      },
      {
        q: "Can I add a battery later?",
        a: "Yes. We design systems to be battery-ready so storage can be added at any time to store daytime generation for evening use.",
      },
    ],
    ctaLabel: "Get a Solar Quote",
  },
  {
    slug: "battery-storage",
    name: "Battery Storage",
    navLabel: "Battery",
    icon: "battery",
    summary: "Store your energy. Use it when you need it.",
    headline: "Store your energy. Use it when you need it.",
    subhead:
      "Home and commercial battery systems that capture your solar — or cheap off-peak power — and put you in control of when you use it.",
    seoTitle: "Battery Storage Installation | Home Battery Systems | Elixa",
    seoDescription:
      "Home and commercial battery storage across the UK. Store solar generation and off-peak electricity, manage energy intelligently and keep essential circuits backed up.",
    heroImage: "/images/services/battery.svg",
    intro: [
      "A battery lets you use the energy you generate — not just the energy you happen to use during daylight. Store surplus solar by day and power your home through the evening.",
      "Without solar, a battery still pays: charge from the grid on cheap off-peak tariffs and discharge during expensive peak hours.",
    ],
    capabilities: [
      "Home battery systems",
      "Commercial battery storage",
      "Solar integration",
      "Off-peak tariff charging",
      "Intelligent energy management",
      "Smart monitoring & control",
      "Backup circuits where suitable",
      "Scalable, modular capacity",
    ],
    highlights: [
      {
        title: "Own your solar",
        body: "Store daytime generation and slash the power you buy back from the grid at peak rates.",
      },
      {
        title: "Beat peak pricing",
        body: "Charge on low-cost overnight tariffs and run your home on stored energy when prices climb.",
      },
      {
        title: "Backup ready",
        body: "Where the system and property allow, keep essential circuits running through a power cut.",
      },
    ],
    integrations: ["solar-pv", "ev-charging", "air-source-heat-pumps"],
    faqs: [
      {
        q: "Do I need solar to benefit from a battery?",
        a: "No. A battery can charge from the grid during cheap off-peak periods and discharge at peak times, reducing your bills. Paired with solar, the savings are greater still.",
      },
      {
        q: "How big a battery do I need?",
        a: "It depends on your usage, solar size and goals. We size storage to your consumption profile so you're not paying for capacity you won't use.",
      },
    ],
    ctaLabel: "Explore Battery Storage",
  },
  {
    slug: "air-source-heat-pumps",
    name: "Air Source Heat Pumps",
    navLabel: "Heat Pumps",
    icon: "heatpump",
    summary: "Low-carbon heating for the modern home.",
    headline: "Low-carbon heating for the modern home.",
    subhead:
      "Efficient air source heat pumps that draw warmth from the outside air — expertly designed, installed and integrated with your wider energy system.",
    seoTitle: "Air Source Heat Pump Installation | Heat Pump Installers | Elixa",
    seoDescription:
      "Air source heat pump design and installation across the UK. Heating and hot-water system design, controls, retrofit and new-build, integrated with solar and battery.",
    heroImage: "/images/services/heatpump.svg",
    intro: [
      "An air source heat pump extracts heat from the outside air and upgrades it to warm your home and hot water — delivering far more energy than it consumes.",
      "The result depends entirely on the design. Our engineers size the system to your property's heat loss so it runs efficiently and comfortably all winter.",
    ],
    capabilities: [
      "Air source heat pump installation",
      "Whole-system heat-loss design",
      "Hot-water cylinder integration",
      "Smart heating controls",
      "Existing-property upgrades",
      "New-build installations",
      "Radiator & emitter sizing",
      "Solar & battery integration",
    ],
    highlights: [
      {
        title: "Efficiency by design",
        body: "Performance lives and dies by the design. We calculate heat loss room by room so your system runs at low, efficient flow temperatures.",
      },
      {
        title: "Comfort, quietly",
        body: "Modern units are discreet and quiet, delivering steady, even warmth rather than the peaks and troughs of a gas boiler.",
      },
      {
        title: "Powered by your roof",
        body: "Pair with solar and battery so more of your heating runs on electricity you generated yourself.",
      },
    ],
    integrations: ["solar-pv", "battery-storage", "underfloor-heating", "thermaskirt"],
    faqs: [
      {
        q: "Will a heat pump keep my home warm in winter?",
        a: "Yes — a correctly designed and installed heat pump maintains comfortable temperatures throughout a UK winter. Good design and the right emitters are essential, which is exactly where our engineering focus goes.",
      },
      {
        q: "Is my home suitable?",
        a: "Most homes are suitable with the right design. We assess insulation, emitters and space during a survey and tell you honestly what's required.",
      },
    ],
    ctaLabel: "Get a Heat Pump Quote",
  },
  {
    slug: "air-conditioning",
    name: "Air Conditioning & Climate Control",
    navLabel: "Air Conditioning",
    icon: "aircon",
    summary: "One system. Year-round comfort.",
    headline: "Air conditioning. Heating. Complete climate control.",
    subhead:
      "Professional air conditioning for homes and businesses, installed by fully qualified F-Gas engineers — cooling in summer, efficient heating in winter.",
    seoTitle: "Air Conditioning Installation | Residential & Commercial | F-Gas Engineers | Elixa",
    seoDescription:
      "Professional air conditioning installation across the UK by fully qualified F-Gas engineers. Residential and commercial cooling and heating, single and multi-split systems, servicing and maintenance.",
    heroImage: "/images/services/aircon.svg",
    intro: [
      "Modern air conditioning does far more than cool. A single system delivers refreshing cooling in summer and efficient, controllable heating in the cooler months — year-round comfort from one discreet unit.",
      "Every installation is carried out by fully qualified F-Gas engineers and designed for the room, the building and the way you actually use the space.",
    ],
    capabilities: [
      "Residential air conditioning",
      "Commercial air conditioning",
      "Heating & cooling systems",
      "Single-room installations",
      "Multi-split systems",
      "Bedrooms, living spaces & home offices",
      "Offices, shops & commercial premises",
      "System upgrades & replacements",
      "Servicing & maintenance",
    ],
    highlights: [
      {
        title: "One system, year-round",
        body: "Cool in summer, heat in winter. A modern heat-pump air conditioner gives you complete climate control from a single, efficient unit.",
      },
      {
        title: "Fully qualified F-Gas engineers",
        body: "Refrigerant work is carried out by qualified F-Gas engineers — installed correctly, safely and to standard.",
      },
      {
        title: "Discreet by design",
        body: "Wall, ceiling and concealed options installed cleanly so the technology blends into the space, not dominates it.",
      },
    ],
    integrations: ["solar-pv", "battery-storage"],
    faqs: [
      {
        q: "Can air conditioning heat my home too?",
        a: "Yes. Modern systems run in reverse to provide efficient heating as well as cooling, making them a genuine year-round climate-control solution.",
      },
      {
        q: "Who carries out the installation?",
        a: "All refrigerant work is completed by fully qualified F-Gas engineers, ensuring your system is installed safely and correctly.",
      },
      {
        q: "Do you cover commercial premises?",
        a: "Yes — from a single office or shop to multi-split systems across larger commercial spaces, plus servicing and maintenance.",
      },
    ],
    ctaLabel: "Get an Air Conditioning Quote",
  },
  {
    slug: "thermaskirt",
    name: "ThermaSkirt Heating",
    navLabel: "ThermaSkirt",
    icon: "thermaskirt",
    summary: "Heating without the radiators.",
    headline: "Heating without the radiators.",
    subhead:
      "ThermaSkirt replaces conventional radiators with heated skirting — a discreet, space-saving way to warm a room evenly, ideal for renovations and new builds.",
    seoTitle: "ThermaSkirt Installation | Skirting Board Heating | Elixa",
    seoDescription:
      "ThermaSkirt skirting-board heating installation across the UK. A discreet, space-saving alternative to radiators for renovations, extensions and new builds, integrated with heat pumps.",
    heroImage: "/images/services/thermaskirt.svg",
    intro: [
      "ThermaSkirt integrates heating into the skirting board, warming a room gently and evenly from its perimeter — with none of the wall space or visual clutter of radiators.",
      "It runs beautifully at low flow temperatures, making it an excellent partner for a heat pump, and installs above ground with minimal disruption.",
    ],
    capabilities: [
      "Residential applications",
      "Renovations & refurbishments",
      "Extensions",
      "New builds",
      "Space-saving heating",
      "Heating-system integration",
      "Heat-pump optimised",
      "Above-ground, low-disruption fit",
    ],
    highlights: [
      {
        title: "Reclaim your walls",
        body: "No bulky radiators means freedom to place furniture where you want and a cleaner, calmer interior.",
      },
      {
        title: "Even, gentle warmth",
        body: "Heat radiates from the room's perimeter for comfortable, consistent temperatures without cold spots.",
      },
      {
        title: "Made for heat pumps",
        body: "Efficient at low flow temperatures, ThermaSkirt is an ideal emitter for a modern low-carbon system.",
      },
    ],
    integrations: ["air-source-heat-pumps", "underfloor-heating"],
    faqs: [
      {
        q: "Is ThermaSkirt an alternative to underfloor heating?",
        a: "It can be. ThermaSkirt heats from the skirting rather than the floor, so it's ideal for renovations where lifting floors isn't practical, while still running at efficient low temperatures.",
      },
    ],
    ctaLabel: "Discover ThermaSkirt",
  },
  {
    slug: "underfloor-heating",
    name: "Underfloor Heating",
    navLabel: "Underfloor Heating",
    icon: "underfloor",
    summary: "Comfort from the ground up.",
    headline: "Comfort from the ground up.",
    subhead:
      "Whole-home or zoned underfloor heating that delivers gentle, even warmth at low temperatures — the ideal partner for a heat pump.",
    seoTitle: "Underfloor Heating Installation | Wet UFH Systems | Elixa",
    seoDescription:
      "Underfloor heating installation across the UK for renovations, extensions and new builds. Whole-home and zoned systems with smart controls, integrated with heat pumps.",
    heroImage: "/images/services/underfloor.svg",
    intro: [
      "Underfloor heating warms a room from the floor up, spreading gentle heat evenly across the whole space — no radiators, no cold corners.",
      "Because it works at low flow temperatures, it's a natural match for a heat pump and one of the most comfortable ways to heat a modern home.",
    ],
    capabilities: [
      "Underfloor heating systems",
      "Renovation projects",
      "New builds",
      "Extensions",
      "Heat-pump integration",
      "Whole-home heating",
      "Individual zones",
      "Smart controls",
    ],
    highlights: [
      {
        title: "Invisible comfort",
        body: "All the warmth, none of the hardware. Free walls and a clean, uncluttered interior throughout.",
      },
      {
        title: "Room-by-room control",
        body: "Zoned controls let every space run to its own schedule and temperature for comfort and efficiency.",
      },
      {
        title: "Low-temperature by nature",
        body: "The large surface area heats efficiently at low flow temperatures — perfect for a heat pump.",
      },
    ],
    integrations: ["air-source-heat-pumps", "thermaskirt", "solar-pv"],
    faqs: [
      {
        q: "Can underfloor heating be retrofitted?",
        a: "Yes. Low-profile systems make retrofit possible in many renovations and extensions, not just new builds. We assess your floor build-up and advise on the best approach.",
      },
    ],
    ctaLabel: "Get a Heating Quote",
  },
  {
    slug: "ev-charging",
    name: "EV Charging",
    navLabel: "EV Charging",
    icon: "ev",
    summary: "Smart charging at home & work.",
    headline: "Smart charging at home & work.",
    subhead:
      "Home and commercial EV chargers that charge intelligently — using your solar, your battery and cheaper off-peak power.",
    seoTitle: "EV Charger Installation | Home & Commercial EV Charging | Elixa",
    seoDescription:
      "EV charger installation across the UK for homes and businesses. Smart charging integrated with solar and battery storage, plus energy management and load balancing.",
    heroImage: "/images/services/ev.svg",
    intro: [
      "A dedicated EV charger is faster, safer and smarter than a plug socket — and when it's integrated with your energy system, it's cheaper too.",
      "Charge from your own solar, top up from your battery, or schedule charging for cheap overnight rates automatically.",
    ],
    capabilities: [
      "Home EV chargers",
      "Commercial EV charging",
      "Solar integration",
      "Battery integration",
      "Smart, scheduled charging",
      "Energy management & load balancing",
      "Tethered & untethered units",
      "Fleet & workplace charging",
    ],
    highlights: [
      {
        title: "Charge on sunshine",
        body: "Integrate with solar so your car tops up on the clean energy your roof produces during the day.",
      },
      {
        title: "Cheaper by schedule",
        body: "Smart charging targets low-cost off-peak windows automatically — no plugging in at midnight.",
      },
      {
        title: "Ready for scale",
        body: "From a single home charger to workplace and fleet installations with proper load balancing.",
      },
    ],
    integrations: ["solar-pv", "battery-storage"],
    faqs: [
      {
        q: "Can my EV charger use my solar power?",
        a: "Yes. Solar-integrated chargers can prioritise your own generation, so your car charges on clean energy you produced rather than power from the grid.",
      },
    ],
    ctaLabel: "Get an EV Charger Quote",
  },
];

export const serviceBySlug = (slug: string) =>
  services.find((s) => s.slug === slug);

export const serviceSlugs = services.map((s) => s.slug);
