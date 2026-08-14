import type { IconKey } from "@/content/services";

/** Line-style service icons on a 48px grid, currentColor stroke. */
export function ServiceIcon({ name, className }: { name: IconKey; className?: string }) {
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "solar":
      return (
        <svg {...common}>
          <rect x="7" y="20" width="34" height="18" rx="2" />
          <path d="M7 26h34M7 32h34M18 20v18M30 20v18" opacity="0.6" />
          <circle cx="38" cy="10" r="3.5" />
          <path d="M38 3v2M38 15v1M31 10h1M45 10h1M33 5l1 1M42 14l1 1" />
        </svg>
      );
    case "battery":
      return (
        <svg {...common}>
          <rect x="13" y="8" width="22" height="33" rx="4" />
          <path d="M20 6h8" />
          <path d="M25 16l-4 8h6l-4 8" />
        </svg>
      );
    case "heatpump":
      return (
        <svg {...common}>
          <rect x="7" y="13" width="34" height="22" rx="3" />
          <circle cx="24" cy="24" r="6.5" />
          <path d="M24 17.5v13M17.5 24h13" />
          <path d="M11 39v2M37 39v2" />
        </svg>
      );
    case "aircon":
      return (
        <svg {...common}>
          <rect x="7" y="11" width="34" height="13" rx="3" />
          <path d="M11 17h26" opacity="0.6" />
          <path d="M14 30c0 3-2 4-2 7M24 30c0 3-2 4-2 7M34 30c0 3-2 4-2 7" />
        </svg>
      );
    case "thermaskirt":
      return (
        <svg {...common}>
          <path d="M6 34h36" />
          <rect x="6" y="30" width="36" height="8" rx="2" />
          <path d="M12 30v-5M20 30v-8M28 30v-5M36 30v-9" opacity="0.6" />
        </svg>
      );
    case "underfloor":
      return (
        <svg {...common}>
          <path d="M8 14c4-5 8-5 12 0s8 5 12 0 8-5 8 0" />
          <path d="M8 24c4-5 8-5 12 0s8 5 12 0 8-5 8 0" />
          <path d="M8 34c4-5 8-5 12 0s8 5 12 0 8-5 8 0" />
        </svg>
      );
    case "ev":
      return (
        <svg {...common}>
          <rect x="9" y="16" width="22" height="24" rx="3" />
          <path d="M9 24h22" opacity="0.6" />
          <path d="M31 22h4a3 3 0 0 1 3 3v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-9l-4-4" />
          <path d="M19 20l-3 5h4l-3 5" />
        </svg>
      );
    default:
      return null;
  }
}
