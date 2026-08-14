import type { IconKey } from "@/content/services";

export interface Hotspot {
  id: IconKey;
  label: string;
  slug: string;
  blurb: string;
  /** 3D anchor position [x,y,z] in the stylised house scene. */
  pos: [number, number, number];
  /** 2D anchor (percent) for the SVG fallback. */
  pos2d: { x: number; y: number };
}

export const hotspots: Hotspot[] = [
  {
    id: "solar",
    label: "Solar PV",
    slug: "/solar-pv",
    blurb: "Panels on the roof generate clean electricity from daylight — powering the home and charging the battery.",
    pos: [-0.9, 2.35, 1.2],
    pos2d: { x: 34, y: 22 },
  },
  {
    id: "battery",
    label: "Battery Storage",
    slug: "/battery-storage",
    blurb: "Stores surplus solar and cheap off-peak power, ready to use when you need it most.",
    pos: [1.7, 0.5, 1.3],
    pos2d: { x: 70, y: 62 },
  },
  {
    id: "heatpump",
    label: "Air Source Heat Pump",
    slug: "/air-source-heat-pumps",
    blurb: "Draws warmth from the outside air to heat the home and hot water, efficiently and quietly.",
    pos: [-2.1, 0.45, 1.1],
    pos2d: { x: 14, y: 66 },
  },
  {
    id: "aircon",
    label: "Air Conditioning",
    slug: "/air-conditioning",
    blurb: "Cools in summer and heats in winter — complete climate control from one discreet system.",
    pos: [0.7, 1.5, 1.55],
    pos2d: { x: 58, y: 42 },
  },
  {
    id: "thermaskirt",
    label: "ThermaSkirt Heating",
    slug: "/thermaskirt",
    blurb: "Heated skirting warms rooms gently from the perimeter — no radiators, no lost wall space.",
    pos: [-0.7, 0.35, 1.75],
    pos2d: { x: 40, y: 74 },
  },
  {
    id: "underfloor",
    label: "Underfloor Heating",
    slug: "/underfloor-heating",
    blurb: "Even, low-temperature warmth across the whole floor — the ideal partner for a heat pump.",
    pos: [0.4, 0.12, 1.9],
    pos2d: { x: 50, y: 84 },
  },
  {
    id: "ev",
    label: "EV Charging",
    slug: "/ev-charging",
    blurb: "Smart home charging that tops up your car on your own solar and cheap off-peak power.",
    pos: [2.4, 0.35, 0.4],
    pos2d: { x: 86, y: 72 },
  },
];
