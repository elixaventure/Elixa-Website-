/**
 * Technical linework illustrations — each product drawn as a thin-stroke
 * engineering elevation. Shared conventions: 320×400 viewBox, hairline white
 * strokes with a single accent element, small dimension ticks for the
 * drawing-board feel. Swapped for real installation photography per panel by
 * giving that panel an `image` in content instead.
 */

const S = "rgba(245,247,248,0.55)";
const F = "rgba(245,247,248,0.16)";
const A = "#3EC5B4";

function Dim({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g stroke={F} strokeWidth="1">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} />
      <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} />
    </g>
  );
}

export function ArtHeatPump() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <rect x="60" y="90" width="200" height="220" rx="10" stroke={S} strokeWidth="1.4" />
      <circle cx="130" cy="200" r="58" stroke={S} strokeWidth="1.4" />
      <circle cx="130" cy="200" r="6" fill={A} />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path key={r} d="M130 148 C150 168 150 186 134 196" stroke={A} strokeWidth="1.2" opacity="0.8" transform={`rotate(${r} 130 200)`} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={210} y1={112 + i * 24} x2={246} y2={112 + i * 24} stroke={S} strokeWidth="1.1" />
      ))}
      <line x1="80" y1="310" x2="80" y2="330" stroke={S} strokeWidth="1.4" />
      <line x1="240" y1="310" x2="240" y2="330" stroke={S} strokeWidth="1.4" />
      <line x1="40" y1="330" x2="280" y2="330" stroke={F} strokeWidth="1" />
      <Dim x1={60} y1={352} x2={260} y2={352} />
    </svg>
  );
}

export function ArtSolar() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <path d="M40 300 L160 90 L280 300" stroke={F} strokeWidth="1" />
      <g transform="translate(160 210) skewX(-18) translate(-160 -210)">
        <rect x="105" y="130" width="150" height="170" stroke={S} strokeWidth="1.4" />
        {[1, 2].map((i) => (
          <line key={i} x1={105 + i * 50} y1="130" x2={105 + i * 50} y2="300" stroke={S} strokeWidth="1" />
        ))}
        {[1, 2, 3].map((i) => (
          <line key={i} x1="105" y1={130 + i * 42.5} x2="255" y2={130 + i * 42.5} stroke={S} strokeWidth="1" />
        ))}
        <rect x="105" y="130" width="50" height="42.5" fill={A} opacity="0.25" />
      </g>
      <circle cx="258" cy="96" r="18" stroke={A} strokeWidth="1.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <line key={r} x1="258" y1="70" x2="258" y2="62" stroke={A} strokeWidth="1.2" transform={`rotate(${r} 258 96)`} />
      ))}
      <Dim x1={70} y1={340} x2={250} y2={340} />
    </svg>
  );
}

export function ArtSkirt() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <line x1="50" y1="60" x2="50" y2="270" stroke={S} strokeWidth="1.4" />
      <line x1="50" y1="270" x2="290" y2="270" stroke={S} strokeWidth="1.4" />
      <path d="M50 210 L84 210 L84 224 L74 270 L50 270 Z" stroke={A} strokeWidth="1.4" fill="rgba(62,197,180,0.12)" />
      <circle cx="64" cy="232" r="5" stroke={A} strokeWidth="1.2" />
      <circle cx="64" cy="250" r="5" stroke={A} strokeWidth="1.2" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${104 + i * 34} 250 c 8 -14 -8 -22 0 -38`} stroke={S} strokeWidth="1.1" opacity={0.7 - i * 0.15} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={50 + i * 40} y1="270" x2={50 + i * 40 + 24} y2="286" stroke={F} strokeWidth="1" />
      ))}
      <Dim x1={50} y1={318} x2={290} y2={318} />
    </svg>
  );
}

export function ArtUnderfloor() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <rect x="48" y="72" width="224" height="256" stroke={S} strokeWidth="1.4" />
      <path
        d="M72 96 H248 C258 96 258 128 248 128 H92 C82 128 82 160 92 160 H248 C258 160 258 192 248 192 H92 C82 192 82 224 92 224 H248 C258 224 258 256 248 256 H92 C82 256 82 288 92 288 H240"
        stroke={A}
        strokeWidth="1.6"
        opacity="0.85"
      />
      <circle cx="240" cy="288" r="5" fill={A} />
      <Dim x1={48} y1={352} x2={272} y2={352} />
    </svg>
  );
}

export function ArtBattery() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <rect x="104" y="64" width="112" height="264" rx="8" stroke={S} strokeWidth="1.4" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="120" y={84 + i * 56} width="80" height="40" rx="3" stroke={F} strokeWidth="1.1" />
      ))}
      <rect x="120" y="84" width="80" height="40" rx="3" stroke={A} strokeWidth="1.2" fill="rgba(62,197,180,0.10)" />
      <circle cx="160" cy="312" r="4" fill={A} />
      <line x1="160" y1="40" x2="160" y2="64" stroke={S} strokeWidth="1.2" />
      <path d="M154 46 L166 34" stroke={A} strokeWidth="1.4" />
      <Dim x1={104} y1={352} x2={216} y2={352} />
    </svg>
  );
}

export function ArtEv() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <rect x="88" y="72" width="72" height="128" rx="10" stroke={S} strokeWidth="1.4" />
      <circle cx="124" cy="116" r="20" stroke={A} strokeWidth="1.3" />
      <path d="M120 106 l-6 12 h8 l-4 12 12 -16 h-8 l4 -8 z" fill={A} opacity="0.9" />
      <line x1="124" y1="200" x2="124" y2="330" stroke={S} strokeWidth="1.4" />
      <path d="M160 150 C 230 150 250 210 236 300" stroke={S} strokeWidth="1.3" />
      <rect x="224" y="298" width="26" height="18" rx="4" stroke={A} strokeWidth="1.3" />
      <line x1="60" y1="330" x2="280" y2="330" stroke={F} strokeWidth="1" />
      <Dim x1={88} y1={352} x2={250} y2={352} />
    </svg>
  );
}

/**
 * ThermaSkirt profile range — five cross-sections side by side: Deco 114 mm
 * with plain / torus / ovolo caps, the taller Deco 170 mm, and the Classic
 * bull-nose. Waterway channels drawn as stacked circles, heights dimensioned.
 */
export function ArtSkirtProfiles() {
  const base = 196;
  const boards: { x: number; h: number; cap: "plain" | "torus" | "ovolo" | "bull"; label: string }[] = [
    { x: 46, h: 114, cap: "plain", label: "114" },
    { x: 150, h: 114, cap: "torus", label: "114" },
    { x: 254, h: 114, cap: "ovolo", label: "114" },
    { x: 358, h: 170, cap: "plain", label: "170" },
    { x: 462, h: 150, cap: "bull", label: "TS" },
  ];
  const W = 56;
  return (
    <svg viewBox="0 0 570 240" fill="none" className="h-auto w-full">
      {boards.map((b, i) => {
        const top = base - b.h;
        const cap =
          b.cap === "torus"
            ? `M${b.x} ${top + 16} Q${b.x} ${top} ${b.x + W / 2} ${top} Q${b.x + W} ${top} ${b.x + W} ${top + 16}`
            : b.cap === "ovolo"
              ? `M${b.x} ${top + 14} Q${b.x + 10} ${top + 12} ${b.x + 14} ${top + 4} L${b.x + 14} ${top} L${b.x + W} ${top}`
              : b.cap === "bull"
                ? `M${b.x} ${top + 18} Q${b.x} ${top} ${b.x + 18} ${top} L${b.x + W} ${top}`
                : `M${b.x} ${top} L${b.x + W} ${top}`;
        return (
          <g key={i}>
            <path
              d={`${cap} L${b.x + W} ${base} L${b.x} ${base} Z`}
              stroke="rgba(245,247,248,0.55)"
              strokeWidth="1.3"
            />
            {[0, 1].map((c) => (
              <circle
                key={c}
                cx={b.x + W / 2}
                cy={base - 26 - c * 34}
                r="11"
                stroke={c === 0 ? "#3EC5B4" : "rgba(245,247,248,0.35)"}
                strokeWidth="1.2"
              />
            ))}
            <line x1={b.x - 10} y1={top} x2={b.x - 10} y2={base} stroke="rgba(245,247,248,0.16)" strokeWidth="1" />
            <line x1={b.x - 14} y1={top} x2={b.x - 6} y2={top} stroke="rgba(245,247,248,0.16)" strokeWidth="1" />
            <line x1={b.x - 14} y1={base} x2={b.x - 6} y2={base} stroke="rgba(245,247,248,0.16)" strokeWidth="1" />
            <text
              x={b.x + W / 2}
              y={base + 24}
              textAnchor="middle"
              fill="rgba(245,247,248,0.45)"
              fontSize="11"
              fontFamily="IBM Plex Mono, monospace"
            >
              {b.label}
            </text>
          </g>
        );
      })}
      <line x1="24" y1={base} x2="546" y2={base} stroke="rgba(245,247,248,0.16)" strokeWidth="1" />
    </svg>
  );
}

export function ArtBoiler() {
  return (
    <svg viewBox="0 0 320 400" fill="none" className="h-full w-full">
      <rect x="96" y="72" width="128" height="176" rx="10" stroke={S} strokeWidth="1.4" />
      <circle cx="160" cy="140" r="26" stroke={S} strokeWidth="1.2" />
      <line x1="160" y1="140" x2="174" y2="126" stroke={A} strokeWidth="1.4" />
      <line x1="120" y1="220" x2="200" y2="220" stroke={F} strokeWidth="1.1" />
      {[132, 152, 172, 192].map((x) => (
        <line key={x} x1={x} y1="248" x2={x} y2="320" stroke={S} strokeWidth="1.2" />
      ))}
      <path d="M132 320 h60" stroke={S} strokeWidth="1.2" />
      <circle cx="192" cy="284" r="5" stroke={A} strokeWidth="1.2" />
      <Dim x1={96} y1={352} x2={224} y2={352} />
    </svg>
  );
}
