/**
 * CASE STUDIES — the engineering write-ups, built from Elixa's own
 * published case-study documents. All copy is carried over from those
 * documents; the original PDF for each one is hosted alongside for
 * download. Photos are the documents' own installation photography.
 */

export interface CaseStudySection {
  kicker: string; // "The brief", "The solution", ...
  heading: string;
  paras?: { lead?: string; text: string }[];
  points?: { t: string; d: string }[];
  /** two-column fact table, e.g. the design envelope */
  table?: { title: string; note: string; rows: [string, string][] };
  /** emphasised pull-quote line closing the section */
  pull?: string;
  /** optional photo shown with the section */
  photo?: { src: string; alt: string; caption?: string };
}

export interface CaseStudy {
  slug: string;
  kind: "Installation case study" | "Technical guide";
  tag: string; // short label for cards
  title: string; // the document's punchy headline
  subtitle: string; // the document's descriptive strapline
  standfirst: string;
  cover: { src: string; alt: string };
  specs: [string, string][]; // the cover fact strip
  sections: CaseStudySection[];
  stats?: { note: string; items: { v: string; l: string }[] };
  closing: { pull: string; heading: string; text: string };
  pdf: string;
}

const M = "/media/case-studies";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "cascade-heat-pumps",
    kind: "Installation case study",
    tag: "Cascade heat pumps",
    title: "Two heat pumps. Three jobs.",
    subtitle: "Air source heat pump cascade — space heating, hot water & swimming pool",
    standfirst:
      "A high heat loss property, a full domestic hot water demand and a swimming pool to warm — solved with one intelligently split cascade rather than three separate systems.",
    cover: {
      src: `${M}/cascade-heat-pumps.jpg`,
      alt: "Two twin-fan air source heat pumps installed side by side on level bases against a brick gable elevation",
    },
    specs: [
      ["System", "2× ASHP cascade"],
      ["Configuration", "Shared duty"],
      ["Serves", "Heating, DHW & pool"],
      ["Installer", "Elixa Renewables"],
    ],
    sections: [
      {
        kicker: "The brief",
        heading: "A property that asked three things of one system",
        paras: [
          {
            text: "Most heat pump projects have one job to do: keep the house warm. This one had three — and each of them pulled the design in a different direction.",
          },
          {
            text: "The property carried a heat loss well above the 8–12 kW that covers the majority of UK homes — already at the upper end of what a single domestic monobloc delivers comfortably in mid-winter. Add a full stored hot water demand across multiple bathrooms, and then a swimming pool asking for a long, low-grade, high-volume heat input, and a single appliance solution stops being ambitious and starts being fragile.",
          },
          {
            lead: "One oversized heat pump?",
            text: "Size a single unit for peak heat loss plus pool and you end up with a machine that spends the other nine months of the year cycling badly against a fraction of its output. Short cycling is the fastest way to destroy both efficiency and compressor life.",
          },
          {
            lead: "Three separate systems?",
            text: "A heating unit, a hot water unit and a dedicated pool heater is clean on paper and expensive everywhere else — three sets of groundworks, three electrical supplies, three commissioning visits, three service contracts, and a plant area that no longer fits the space available.",
          },
        ],
        pull: "The design question was not how much heat do we need. It was how do we make the same kilowatts do different work at different times of year, without ever fighting each other.",
        table: {
          title: "The design envelope",
          note: "Indicative parameters for a cascade specification of this type — typical ranges for this class of system, not measured values for this property.",
          rows: [
            ["Property", "Large detached, approx. 250–350 m²"],
            ["Design heat loss", "18–26 kW at −2 to −4 °C external"],
            ["Emitters", "35–40 °C flow underfloor, 45–50 °C radiators"],
            ["Hot water", "300–500 litre unvented cylinder, 3 kW immersion back-up"],
            ["Pool", "45–55 m³; 4–8 kW steady demand with a cover fitted"],
            ["Electrical supply", "25–30 A per unit — three phase common at this scale"],
          ],
        },
      },
      {
        kicker: "The solution",
        heading: "A cascade, with one unit doing double duty",
        paras: [
          {
            text: "Rather than one large appliance or three small ones, we installed two air source heat pumps in cascade, sharing a common primary circuit — but with the two units given deliberately different roles.",
          },
        ],
        points: [
          {
            t: "Unit 1 — dedicated space heating",
            d: "The lead unit is committed to the heating circuit. It carries the base load on its own for the majority of the year, running long, low, weather-compensated cycles at the lowest flow temperature the emitters will allow. No competing demand, no interruptions for hot water, no compromise on efficiency.",
          },
          {
            t: "Unit 2 — shared duty across heating, hot water and pool",
            d: "The second unit is the flexible one. Its output is split at the header so it can support space heating alongside Unit 1 when outside temperatures fall, while also serving the hot water cylinder and the pool heat exchanger when those loads call. In practice it behaves like two half-machines pointing in different directions.",
          },
          {
            t: "Hydraulic separation as the referee",
            d: "Both units feed a hydraulically separated primary, keeping the heat pump circuit independent of the distribution circuits. Every circuit — heating zones, cylinder coil, pool plate heat exchanger — draws through its own pump and isolation, so flow rates stay correct whichever combination of loads is running.",
          },
          {
            t: "Controls that set the priority order",
            d: "The controls decide who gets the heat and when. Hot water takes priority for short, defined windows. Space heating takes precedence over the pool during cold weather. The pool picks up surplus capacity in the shoulder seasons, when there is plenty of it going spare.",
          },
        ],
        pull: "In mid-winter the property has the full output of two heat pumps behind the heating. In summer, one unit covers hot water while the other quietly heats the pool. Nothing is oversized for the job it is doing at the time.",
      },
      {
        kicker: "The installation",
        heading: "Built once, built properly",
        paras: [
          {
            text: "Both units sit on level bases against the gable elevation, on anti-vibration mounts, with the primary flow and return runs kept short, insulated and neatly aligned between the two machines. Positioning was chosen for clear airflow across both fan banks and for acoustic performance at the nearest neighbouring window, assessed under MCS 020.",
          },
          {
            text: "Internally the plant is arranged around the separated primary, with individually valved circuits so any zone, the cylinder or the pool exchanger can be isolated without draining the system.",
          },
        ],
        points: [
          { t: "Scope of works", d: "2× air source heat pumps in cascade configuration · hydraulic separation, primary pump set and fully valved circuit manifolds · unvented hot water cylinder with immersion back-up · plate heat exchanger and secondary circuit serving the swimming pool · weather compensation and priority-based control strategy · dedicated electrical circuits, isolation and protection · system flushing, inhibitor dosing, commissioning and handover" },
        ],
      },
    ],
    stats: {
      note: "Typical ranges for this class of system, confirmed per project at design stage. Cost comparison based on kerosene at approx. 92p/litre and electricity at 26.11p/kWh, or 13–15p on a heat pump tariff (August 2026).",
      items: [
        { v: "3.0–3.5", l: "Seasonal efficiency for a well-designed low flow temperature cascade" },
        { v: "20–60%", l: "Running cost saving vs oil — lower on a standard tariff, higher on a heat pump tariff" },
        { v: "26–34 kW", l: "Installed cascade capacity for two twin-fan units at A7/W35" },
      ],
    },
    closing: {
      pull: "Where a cascade earns its place: a heat loss above roughly 18 kW, a second heat demand such as a pool or annexe, or a property that cannot afford to be without heat if one appliance faults.",
      heading: "Have a property that asks more than one thing of its heating?",
      text: "High heat loss, a pool, an annexe or awkward emitters — these are the projects where a standard single-unit specification quietly underperforms. We design cascade and multi-load systems from the heat loss up.",
    },
    pdf: `${M}/cascade-heat-pumps.pdf`,
  },

  {
    slug: "arotherm-siting",
    kind: "Installation case study",
    tag: "R290 siting",
    title: "The right spot is everything.",
    subtitle: "Vaillant aroTHERM plus 12 kW — R290 air source heat pump retrofit",
    standfirst:
      "A period cottage, a tight courtyard and an R290 heat pump that has to sit somewhere compliant, quiet and out of the way. Siting designed first, system designed around it.",
    cover: {
      src: `${M}/arotherm-siting.jpg`,
      alt: "Rendered stone cottage with an all-black solar array and a Vaillant aroTHERM plus heat pump beside the patio, an Elixa engineer surveying from the garden",
    },
    specs: [
      ["System", "aroTHERM plus 12 kW"],
      ["Refrigerant", "R290 propane"],
      ["Property", "Period cottage"],
      ["Installer", "Elixa Renewables"],
    ],
    sections: [
      {
        kicker: "The brief",
        heading: "A period cottage, a tight courtyard, and nowhere obvious to put it",
        paras: [
          {
            text: "The hardest part of most heat pump installations is not the heat pump. It is finding a position for it that is compliant, quiet, efficient and something the owner is happy to look at every day.",
          },
          {
            text: "This property is a rendered stone cottage taking a 12 kW unit, with a paved courtyard on the sheltered side and neighbouring properties close by. The usable outdoor space is generous to look at and unforgiving to design around: walls, steps, planting, drainage and windows all competing for the same few square metres.",
          },
          {
            lead: "Refrigerant safety.",
            text: "The unit specified runs on R290 — propane. That brings excellent efficiency and high flow temperatures, but it also brings a defined protective zone around the outdoor unit. Get the position wrong and the installation is not compliant, however tidy it looks.",
          },
          {
            lead: "A courtyard the owners actually use.",
            text: "This is a seating area, not a service yard. Whatever went in had to sit against the elevation and leave the paving, steps and planting exactly as they were.",
          },
          {
            lead: "Existing radiators.",
            text: "A period property with an established heating system. Ripping out every emitter to chase a low flow temperature was neither wanted nor necessary.",
          },
        ],
        pull: "Siting is not the last decision in a heat pump design. On a constrained property it is the first one, and everything else is built around it.",
        table: {
          title: "The design envelope",
          note: "Confirmed specification where stated. Heat loss, floor area and design flow temperature are indicative ranges typical of this class of system rather than measured values for this property.",
          rows: [
            ["Heat pump", "Vaillant aroTHERM plus, 12 kW nominal output"],
            ["Property", "Detached period cottage, approx. 150–220 m²"],
            ["Design heat loss", "9–12 kW at −2 to −4 °C external"],
            ["Emitters", "Existing radiators, 45–55 °C design flow"],
            ["Hot water", "300 litre unvented cylinder with immersion back-up"],
            ["Refrigerant", "R290 propane, GWP of 3 against 675 for R32"],
            ["Siting", "Protective zone survey and full siting design"],
          ],
        },
      },
      {
        kicker: "The solution",
        heading: "Understanding the protective zone",
        paras: [
          {
            text: "R290 is propane, and propane is denser than air. That single fact governs how the protective zone behaves — and it is the reason this position works.",
          },
        ],
        points: [
          {
            t: "The zone projects outwards and downwards, not upwards",
            d: "In the unlikely event of a leak, refrigerant sinks and disperses at low level. The manufacturer's protective zone therefore extends around and below the unit, not above it. A position that looks wrong at a glance can be entirely correct once the geometry is understood.",
          },
          {
            t: "No openings or ignition sources within the zone",
            d: "Windows, doors, light shafts, cellar entrances, flat-roof windows and ventilation openings must all fall outside it, as must ignition sources such as sockets, lamps and rotary isolators. Every one of those was surveyed and plotted before the base was laid.",
          },
          {
            t: "Quiet enough to sit next to",
            d: "The aroTHERM plus is Quiet Mark accredited, and in a sheltered courtyard it is unobtrusive in normal use. The position still earns that: solid wall behind, clear discharge across open paving, nothing for the fan to push against.",
          },
          {
            t: "High flow temperature, existing radiators retained",
            d: "R290 delivers usable flow temperatures well beyond what older refrigerants manage comfortably. That kept the existing emitters in service and the disruption outdoors, where it belongs.",
          },
        ],
        photo: {
          src: `${M}/arotherm-final-position.jpg`,
          alt: "Vaillant aroTHERM plus heat pump hard against the cottage elevation, level on bearers with clear discharge across the courtyard paving",
          caption:
            "Final position. Hard against the elevation, level on bearers, clear discharge across the courtyard, planting and paving undisturbed — and every opening on that wall outside the protective zone.",
        },
      },
      {
        kicker: "The installation",
        heading: "Tidy outside, undisturbed inside",
        paras: [
          {
            text: "The outdoor unit sits on solid bearers on the existing paving, with condensate managed away from the walking route and pipework kept short and insulated into the building. The courtyard planting, steps and seating area are exactly as they were.",
          },
          {
            text: "Indoors, the cylinder and controls were installed with the existing radiator circuit retained and rebalanced to suit the new design flow temperature, with weather compensation set at commissioning rather than left on a factory default.",
          },
        ],
        points: [
          { t: "Scope of works", d: "Vaillant aroTHERM plus 12 kW air source heat pump, R290 refrigerant · protective zone survey and siting design prior to installation · full MCS siting and compliance assessment · 300 litre unvented hot water cylinder with immersion back-up · existing radiator circuit retained, rebalanced and re-commissioned · weather compensation control strategy set at commissioning · system flushing, inhibitor dosing, commissioning and handover" },
        ],
      },
    ],
    stats: {
      note: "Typical ranges for this class of system, confirmed per project at design stage. Maximum flow temperature is the manufacturer's stated capability, not a recommended design condition — lower flow temperatures give better efficiency.",
      items: [
        { v: "3.0–3.5", l: "Seasonal efficiency for a well-designed system on existing radiators" },
        { v: "Up to 75 °C", l: "Flow temperature available from R290, so existing emitters can stay" },
        { v: "GWP 3", l: "Global warming potential of propane, against 675 for R32" },
      ],
    },
    closing: {
      pull: "Tight sites are not a reason to say no to a heat pump. They are a reason to design the siting first and the rest of the system around it.",
      heading: "Been told your property is too tight for a heat pump?",
      text: "Courtyards, side returns, terraces, listed and period properties — the positions that look impossible usually are not, once the protective zone is properly understood. We survey siting before we quote.",
    },
    pdf: `${M}/arotherm-siting.pdf`,
  },

  {
    slug: "ecodan-full-system",
    kind: "Installation case study",
    tag: "Full system design",
    title: "The heat pump is the easy part.",
    subtitle: "Mitsubishi Ecodan — full system design and upgrade",
    standfirst:
      "A modern house, sound fabric and every reason to expect a heat pump to perform. Whether it does comes down to the system designed around it, not the unit bolted to the wall.",
    cover: {
      src: `${M}/ecodan-full-system.jpg`,
      alt: "Mitsubishi Ecodan monobloc below the kitchen window sill of a modern brick house, with fully insulated pipework routed neatly up the elevation",
    },
    specs: [
      ["System", "Mitsubishi Ecodan"],
      ["Refrigerant", "R32"],
      ["Scope", "Full system upgrade"],
      ["Installer", "Elixa Renewables"],
    ],
    sections: [
      {
        kicker: "The brief",
        heading: "A good house deserves more than a swapped box",
        paras: [
          {
            text: "This is a modern, well-built property with sound fabric and a heating system that worked. On paper, the easy job. In practice, the easy job is where most heat pump installations quietly go wrong.",
          },
          {
            text: "The temptation on a house like this is obvious: take the old heat source out, put the new one in, connect it to whatever is already there and move on. It is faster, cheaper to quote, and wins the job against a properly designed alternative more often than it should. It also produces the installations that give heat pumps their reputation: a unit forced to run at boiler flow temperatures because nobody checked the emitters, a cylinder too small for the household, pipework never sized for the lower temperature difference a heat pump works across, and controls left on whatever the factory shipped them with.",
          },
          {
            lead: "Smaller than people expect.",
            text: "The outdoor unit here is a single fan monobloc. It sits below the sill of the kitchen window, tight to the wall, on the existing patio. No compound, no screening, no rearranged garden. Mitsubishi's Ultra Quiet chassis covers 5 to 11.2 kW in this single fan format, which is enough for most modern family homes, and the current generation runs around three times quieter than the models that gave heat pumps their early reputation.",
          },
        ],
        pull: "A heat pump is not a boiler that runs on electricity. Install it as though it were and it will cost more to run than the thing it replaced — and the customer will blame the technology.",
        table: {
          title: "The design envelope",
          note: "Confirmed specification where stated. Remaining figures are indicative ranges typical of this class of property and system rather than measured values.",
          rows: [
            ["Heat pump", "Mitsubishi Ecodan monobloc, R32 refrigerant"],
            ["Property", "Modern brick-built house, good existing fabric"],
            ["Design heat loss", "5–9 kW, typical of a property of this age and build"],
            ["Design flow", "35–45 °C, weather compensated"],
            ["Hot water", "Unvented cylinder sized to household demand"],
            ["Scope", "Full system: heat source, emitters, cylinder, controls"],
          ],
        },
      },
      {
        kicker: "The solution",
        heading: "Designed from the flow temperature outwards",
        paras: [
          {
            text: "Get the design flow temperature right and everything downstream follows. Get it wrong and no amount of good kit will rescue the running cost.",
          },
        ],
        points: [
          {
            t: "Heat loss calculated room by room",
            d: "Not estimated from floor area, not carried over from the old boiler size. Every room assessed against its actual construction, glazing and exposure, because the whole design rests on that number being right.",
          },
          {
            t: "Emitters checked against the target temperature",
            d: "Each radiator was assessed for output at the design flow temperature rather than at boiler temperatures. Where a room fell short, that emitter was upgraded. Where it did not, it stayed — there is no merit in replacing radiators that already work.",
          },
          {
            t: "Cylinder sized to the household, not to the cupboard",
            d: "Hot water demand was sized against how the house is actually used. An undersized cylinder is the most common cause of a heat pump running hot and expensive all winter, and it is entirely avoidable at design stage.",
          },
          {
            t: "Pipework sized and insulated for low temperature operation",
            d: "Heat pumps move heat across a smaller temperature difference than boilers, so they need more flow to move the same energy. Undersized pipework throttles the system before it starts. External runs are fully lagged, as visible on the elevation.",
          },
          {
            t: "Weather compensation set at commissioning",
            d: "The controls were configured to the property, then the system was balanced and the curve adjusted on site. A default setting is not a commissioning.",
          },
        ],
        pull: "The difference between a heat pump that costs less to run than the system it replaced and one that costs more is almost never the appliance. It is the twenty decisions made around it.",
      },
      {
        kicker: "The installation",
        heading: "Neat where it shows, right where it does not",
        paras: [
          {
            text: "The outdoor unit sits on anti-vibration mounts on the existing patio, positioned for clear airflow and kept close to the point of entry so the primary runs stay short. External pipework is fully insulated and run in straight, level lines with valves accessible for service rather than buried behind the unit.",
          },
          {
            text: "Indoors, the cylinder, controls and circulation were installed as one designed package. The system was flushed, dosed, balanced and commissioned against the design flow temperature, with the settings recorded and handed over rather than left for the customer to discover.",
          },
        ],
        points: [
          { t: "Scope of works", d: "Mitsubishi Ecodan monobloc air source heat pump, R32 refrigerant · room-by-room heat loss calculation and full system design · emitter assessment, with upgrades only where output required it · unvented hot water cylinder sized to household demand · primary pipework sized for low temperature operation and fully insulated · weather compensation controls configured and commissioned on site · system flushing, inhibitor dosing, balancing and documented handover" },
        ],
      },
    ],
    stats: {
      note: "Typical ranges for this class of property and system, confirmed per project at design stage. Efficiency is a consequence of design flow temperature and fabric, not of appliance brand.",
      items: [
        { v: "3.5–4.2", l: "Seasonal efficiency achievable on good fabric at a low design flow temperature" },
        { v: "35–45 °C", l: "Design flow temperature, where the efficiency above comes from" },
        { v: "5–9 kW", l: "Typical design heat loss for a modern house of this size and build" },
      ],
    },
    closing: {
      pull: "If a quote does not tell you the design flow temperature, it is not a design. It is a price for a box on a wall.",
      heading: "Comparing heat pump quotes?",
      text: "Ask every installer for the room-by-room heat loss, the design flow temperature and the cylinder sizing before you compare the price. The cheapest quote is usually the one that has not done them.",
    },
    pdf: `${M}/ecodan-full-system.pdf`,
  },

  {
    slug: "clivet-monobloc",
    kind: "Installation case study",
    tag: "Specification",
    title: "We do not have a favourite brand.",
    subtitle: "Clivet monobloc — specifying to the property, not the brand",
    standfirst:
      "Four case studies, four different manufacturers. Not indecision — the result of specifying against the property every time instead of against a supplier agreement.",
    cover: {
      src: `${M}/clivet-monobloc.jpg`,
      alt: "Clivet Home monobloc heat pump level on a poured concrete plinth beside a brick boundary wall, with insulated flexible connections",
    },
    specs: [
      ["System", "Clivet monobloc"],
      ["Refrigerant", "R32"],
      ["Format", "Single fan"],
      ["Installer", "Elixa Renewables"],
    ],
    sections: [
      {
        kicker: "The brief",
        heading: "Why we did not fit the brand you have heard of",
        paras: [
          {
            text: "Most heat pump quotes start with a brand and work backwards. Ours start with the property and let the brand fall out at the end, which is how a well-specified system occasionally ends up with a badge the customer has never seen before.",
          },
          {
            text: "Clivet is not a household name in the UK. It is a Veneto manufacturer with three decades in air conditioning and a partnership with the Midea group, and its monobloc range is widely fitted across Europe. Unfamiliar is not the same as unproven, and brand recognition is not a design criterion.",
          },
          {
            lead: "What actually decides the specification:",
            text: "output matched to the calculated heat loss, with enough modulation range to run down at part load rather than cycling. Physical footprint that suits the space available. Flow temperature capability that suits the emitters already in the property. Performance held at low ambient temperatures, because January is when it matters. Controls the household will actually use. And parts, support and warranty that will still be there in ten years.",
          },
        ],
        pull: "Every mainstream manufacturer makes a competent heat pump. The difference between a good installation and a poor one is almost never which one you chose — it is whether it was matched to the property.",
        table: {
          title: "The design envelope",
          note: "Confirmed specification where stated. Remaining figures are indicative ranges typical of this class of property and system rather than measured values.",
          rows: [
            ["Heat pump", "Clivet monobloc, R32 refrigerant, single fan"],
            ["Range available", "4 to 30 kW; single fan format up to 16 kW"],
            ["Design heat loss", "6–10 kW, typical of a house of this size and build"],
            ["Design flow", "40–50 °C on existing emitters, weather compensated"],
            ["Hot water", "200–250 litre unvented cylinder"],
            ["Siting", "Concrete plinth, anti-vibration feet, insulated flexible connections"],
          ],
        },
      },
      {
        kicker: "The solution",
        heading: "Five reasons this unit suited this house",
        paras: [
          {
            text: "None of these are marketing points. They are the things that were checked against the property before anything was ordered.",
          },
        ],
        points: [
          {
            t: "Single fan, compact footprint",
            d: "The Clivet range stays single fan all the way up to 16 kW, which keeps the outdoor unit shorter and lighter than a twin fan machine of similar output. On a paved side area with a boundary wall close behind, that is the difference between a tidy installation and a compromised one.",
          },
          {
            t: "Flow temperature high enough for the existing emitters",
            d: "The range delivers flow temperatures up to 65 °C. That headroom meant the existing radiator circuit could be assessed at a sensible design temperature rather than the property being committed to a full emitter replacement before anything else was decided.",
          },
          {
            t: "Performance held at low ambient",
            d: "The range is rated to produce hot water down to −25 °C outside. British winters do not need that, but a machine designed for harsher climates is not working at the edge of its envelope during a cold snap here, which is exactly when a heating system is judged.",
          },
          {
            t: "Quiet and super quiet operating modes",
            d: "Selectable reduced-output modes for evenings and overnight, useful on a property where the unit sits close to a boundary and to neighbouring windows.",
          },
          {
            t: "Controls the household will use",
            d: "App control and Modbus connectivity as standard, so the system can be monitored and adjusted rather than set once and forgotten. A control system nobody understands is a control system nobody optimises.",
          },
        ],
        pull: "Specify to the property, not to the supplier deal. It is the reason our case studies feature four different manufacturers and not one.",
      },
      {
        kicker: "The installation",
        heading: "Level, isolated and accessible",
        paras: [
          {
            text: "The unit sits on a poured concrete plinth rather than directly on block paving. Paving settles, and a monobloc that goes out of level develops condensate and vibration problems that are tedious to fix later. Anti-vibration feet sit between the frame and the plinth so nothing transmits into the structure.",
          },
          {
            text: "Primary connections are made in insulated flexible hoses, which absorb residual movement and make future removal for service straightforward. Pipework runs are lagged externally and enter the building at low level with clear access to isolation valves.",
          },
        ],
        points: [
          { t: "Scope of works", d: "Clivet monobloc air source heat pump, R32 refrigerant · room-by-room heat loss calculation and full system design · poured concrete plinth, anti-vibration mounts and levelling · insulated flexible primary connections and lagged external pipework · unvented hot water cylinder sized to household demand · weather compensation and app-based control configured on site · system flushing, inhibitor dosing, balancing and documented handover" },
        ],
      },
    ],
    stats: {
      note: "Typical ranges for this class of property and system, confirmed per project at design stage. Maximum flow temperature and energy class are manufacturer stated capabilities across the range, not recommended design conditions — lower flow temperatures give better efficiency.",
      items: [
        { v: "3.2–3.8", l: "Seasonal efficiency for a well-designed system on existing radiators" },
        { v: "Up to 65 °C", l: "Flow temperature available, giving headroom on existing emitters" },
        { v: "A++/A+++", l: "Manufacturer energy class across the range, model and temperature dependent" },
      ],
    },
    closing: {
      pull: "If your installer only ever quotes one manufacturer, ask why. It should be because it suited your property, not because it suited their buying.",
      heading: "Want a specification, not a sales pitch?",
      text: "We size and specify against your property and tell you plainly why the machine we have chosen is the right one for it.",
    },
    pdf: `${M}/clivet-monobloc.pdf`,
  },

  {
    slug: "buffers-volumisers",
    kind: "Technical guide",
    tag: "System volume",
    title: "Do you actually need a buffer?",
    subtitle: "System volume, buffers and volumisers — what to ask before you buy",
    standfirst:
      "Some heat pump systems genuinely need added water volume. Plenty have one fitted that should not. Here is how to tell the difference, and what to ask the installer who is quoting you.",
    cover: {
      src: `${M}/buffers-volumisers.jpg`,
      alt: "Heat pump plant room first fix with copper pipework set square around a hydraulic separation unit and expansion vessels",
    },
    specs: [
      ["Topic", "System volume"],
      ["Covers", "Buffer vs volumiser"],
      ["For", "Homeowners & specifiers"],
      ["From", "Elixa Renewables"],
    ],
    sections: [
      {
        kicker: "The principle",
        heading: "Why water volume decides how a heat pump behaves",
        paras: [
          {
            text: "A boiler can fire hard for ten minutes and stop. A heat pump cannot. It wants to run long, low and steady — and to do that it needs enough water in the system to run against.",
          },
          {
            lead: "It powers the defrost cycle.",
            text: "In cold, damp weather the outdoor unit ices up and briefly reverses, pulling heat back out of the heating system to melt it. That energy has to come from somewhere. In a system holding too little water, the defrost either drags the house noticeably cold or fails to complete — and a heat pump that cannot defrost properly cannot heat properly.",
          },
          {
            lead: "It stops short cycling.",
            text: "On a mild day the heat pump may only need a fraction of its output. With too little water to absorb that heat, it satisfies in minutes, shuts down, and starts again. BS EN 14511 advises a heat pump should not start more than three times an hour. Cycling wrecks both seasonal efficiency and compressor life, and it is the single most common cause of a heat pump costing more to run than the system it replaced.",
          },
        ],
        pull: "It is total system volume that matters — radiators, underfloor circuits and pipework included. A buffer or volumiser is what you add when the emitters do not hold enough on their own. It is a top-up, not the whole answer.",
        table: {
          title: "How much is enough",
          note: "Published guidance, for reference. Every system is sized against the specific appliance and the actual emitter volume on site.",
          rows: [
            ["BS EN 14511", "Around 25 litres per kW of heat pump output, for defrost"],
            ["BS EN 15450", "Buffer volume in the range of 12 to 35 litres per kW"],
            ["Starts per hour", "No more than three, per BS EN 14511"],
            ["Useful volume", "Roughly 17–18 litres per kW of heat loss; more at very low flow temperatures"],
            ["What counts", "Radiators, underfloor circuits, active pipework, plus any buffer"],
            ["What does not", "Volume behind a closed zone valve or a shut TRV"],
          ],
        },
      },
      {
        kicker: "The situations",
        heading: "Five properties that will need one",
        paras: [
          {
            text: "These are the situations where added volume or hydraulic separation stops being optional. If your property looks like one of them, ask any installer quoting you how they are handling it.",
          },
        ],
        points: [
          {
            t: "The heavily zoned house",
            d: "Three or four zones, TRVs on most radiators, upstairs and downstairs on separate stats. On a mild evening almost everything closes and the water still available to the heat pump collapses to a fraction of the system total. The house that looks like it has plenty of volume on paper has almost none in practice.",
          },
          {
            t: "The modern house with low water content emitters",
            d: "Newer radiators hold far less water than the heavy steel panels they replaced, and underfloor heating in screed holds less than most people assume. A well insulated new build can easily fall short of the minimum volume its heat pump needs, precisely because everything in it is efficient and slim.",
          },
          {
            t: "More than one thing to heat",
            d: "Heating, hot water, an annexe, underfloor with a blending set, a swimming pool. Each wants a different flow rate and often a different temperature. Hydraulic separation lets each circuit run its own pump and its own conditions instead of fighting the others.",
          },
          {
            t: "Two or more heat pumps in cascade",
            d: "Multiple units feeding a common circuit need a stable point to meet. Without separation, one unit ends up pumping through the other, flow rates drift and the control strategy has nothing dependable to work against.",
          },
          {
            t: "The retrofit where the pipework cannot change",
            d: "Microbore, buried in solid floors, or a listed building where lifting the floors is not happening. If the distribution circuit physically cannot deliver the flow rate the heat pump needs, separation lets the heat pump run its own flow on its side and the house run what it can on the other.",
          },
        ],
        pull: "Four of these five are about flow and separation, not about litres. That distinction is what decides whether you need a volumiser, a buffer, or neither.",
      },
      {
        kicker: "The other half",
        heading: "When you should not fit one",
        paras: [
          {
            text: "A buffer is not free. Fitted where it is not needed, or piped badly where it is, it costs efficiency, cupboard space and money. A single zone system, weather compensated, running open loop with emitters that already hold enough water does not need one. Adding a four-port buffer to that system introduces mixing between flow and return, raises the return temperature going back to the heat pump, and quietly takes efficiency off a system that was working properly. Some of the worst performing heat pump installations in the country have a buffer fitted for no reason other than habit.",
          },
          {
            lead: "A volumiser",
            text: "is a two-port vessel plumbed in series, usually on the return to the heat pump. It adds volume and nothing else. No mixing, no penalty on return temperature. Where the only problem is litres, this is usually the right answer.",
          },
          {
            lead: "A four-port buffer",
            text: "hydraulically separates the heat pump circuit from the distribution circuits. That is what you want when flow rates or temperatures differ across circuits, or when multiple heat sources share one system — but it has to be piped and controlled correctly or it will cost you performance.",
          },
        ],
        points: [
          { t: "Question one", d: "What is my total system volume, and what does the appliance require?" },
          { t: "Question two", d: "Am I getting a volumiser or a buffer, and why that one?" },
          { t: "Question three", d: "How is it piped, and what does it do to my return temperature?" },
        ],
        pull: "An installer who cannot answer all three has not designed your system. Figures quoted from BS EN 14511 and BS EN 15450 as general guidance; sizing is always against the specific appliance and the actual emitter volume on site.",
      },
    ],
    closing: {
      pull: "The three questions above belong in every heat pump conversation — whoever you ask them of.",
      heading: "Not sure what you have been quoted for?",
      text: "We will tell you plainly whether your property needs added volume, separation, both or neither — and show you the numbers behind the answer.",
    },
    pdf: `${M}/buffers-volumisers.pdf`,
  },
];
