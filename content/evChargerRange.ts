/**
 * EV CHARGING — the chargers shown on the EV Charging page.
 *
 * To add, remove or reorder a charger, edit this list; the page renders
 * from here. All are 7.4 kW smart chargers meeting UK smart-charging
 * regulations — the differences that matter are solar awareness, tariff
 * intelligence and design.
 */

export interface EvCharger {
  id: string;
  brand: string;
  model: string;
  /** one line on what the charger has a reputation for */
  knownFor: string;
  /** charging power */
  power: string;
  /** cable arrangement */
  cable: string;
  /** solar behaviour */
  solar: string;
  /** the stand-out capability */
  standout: string;
  /** which homes/situations we tend to specify it for */
  goodFit: string;
}

export const EV_CHARGER_RANGE: EvCharger[] = [
  {
    id: "myenergi-zappi",
    brand: "myenergi",
    model: "zappi",
    knownFor:
      "The solar king — British-made, and the charger that made charging your car from your own roof mainstream.",
    power: "7.4 kW single-phase",
    cable: "Tethered or untethered",
    solar: "Eco and Eco+ modes charge from surplus solar first",
    standout: "Built-in PEN fault protection — no earth rod to dig in",
    goodFit:
      "Any home with solar panels, or planning them — surplus generation goes into the car instead of the grid, and the myenergi ecosystem grows into batteries and diverters.",
  },
  {
    id: "ohme-home-pro",
    brand: "Ohme",
    model: "Home Pro",
    knownFor:
      "The tariff genius — it watches electricity prices and charges when your tariff is cheapest, automatically.",
    power: "7.4 kW single-phase",
    cable: "Tethered, with on-charger screen",
    solar: "Charges in cheap windows; pairs well with export tariffs",
    standout: "Deep integration with smart tariffs like Intelligent Octopus",
    goodFit:
      "Time-of-use tariff households — set the miles you need by morning and it finds the cheapest half-hours overnight to deliver them.",
  },
  {
    id: "hypervolt-home-3-pro",
    brand: "Hypervolt",
    model: "Home 3 Pro",
    knownFor:
      "The design-led Brit — a clean, compact unit with an LED halo, engineered and supported in the UK.",
    power: "7.4 kW single-phase",
    cable: "Tethered or untethered",
    solar: "Solar charging mode with power monitoring",
    standout: "Slim housing and voice-assistant control",
    goodFit:
      "Front-of-house installs where the charger will be seen — smart, solar-capable and tidy on the wall without the utility-box look.",
  },
  {
    id: "andersen-a2",
    brand: "Andersen",
    model: "A2",
    knownFor:
      "The premium one — a British-built charger designed like furniture, with the cable hidden inside the cabinet.",
    power: "7.4 kW single-phase",
    cable: "Fully concealed tethered cable",
    solar: "Solar charging with configurable priority",
    standout: "Interchangeable front panels — timber, colour or steel",
    goodFit:
      "Design-led homes and period frontages — the only charger here you'd choose for how it looks as much as what it does.",
  },
];

/** the honest caveat that sits under the range */
export const EV_NOTE =
  "All figures are manufacturer-published. 7.4 kW is the practical maximum on a standard UK single-phase supply — roughly 25–30 miles of range per hour, which fills almost any EV overnight. Every install includes the supply check, a dedicated protected circuit and app setup before we leave.";
