import type { Config } from "tailwindcss";

/**
 * Elixa Renewables Group design tokens.
 * Deep navy base, green→cyan gradient accent, generous type scale.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1A3A6B",
          50: "#eef3fa",
          100: "#d6e2f2",
          200: "#adc4e4",
          300: "#7d9fd0",
          400: "#4d76b4",
          500: "#2f5691",
          600: "#1A3A6B",
          700: "#152f57",
          800: "#102244",
          900: "#0b1830",
          950: "#070f20",
        },
        elixa: {
          green: "#6ABF4B",
          cyan: "#1D9ED9",
          teal: "#35b1ab",
        },
        ink: "#0d1b30",
        night: {
          DEFAULT: "#080B0F",
          deep: "#0B1016",
          surface: "#111820",
          raise: "#161F29",
          text: "#F5F7F8",
          muted: "#8A96A1",
          faint: "#5A646E",
          accent: "#3EC5B4",
          accent2: "#1D9ED9",
          line: "rgba(245,247,248,0.08)",
        },
        mist: "#f6f9fc",
        cloud: "#eef3f8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Manrope", "Inter", "system-ui", "sans-serif"],
        arch: ["Archivo", "Inter", "system-ui", "sans-serif"],
        techmono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      backgroundImage: {
        "elixa-gradient": "linear-gradient(115deg, #6ABF4B 0%, #35b1ab 45%, #1D9ED9 100%)",
        "elixa-gradient-soft":
          "linear-gradient(115deg, rgba(106,191,75,.14), rgba(29,158,217,.14))",
      },
      boxShadow: {
        card: "0 2px 10px rgba(16,34,68,.06)",
        elevated: "0 18px 50px rgba(16,34,68,.14)",
        floating: "0 30px 80px rgba(16,34,68,.20)",
        glow: "0 12px 40px rgba(29,158,217,.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        container: "1240px",
      },
      transitionTimingFunction: {
        elixa: "cubic-bezier(.22,1,.36,1)",
      },
      keyframes: {
        "flow-dash": {
          to: { strokeDashoffset: "-1000" },
        },
        float: {
          "0%,100%": { transform: "translateY(-6px)" },
          "50%": { transform: "translateY(6px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(29,158,217,.5)" },
          "70%": { boxShadow: "0 0 0 14px rgba(29,158,217,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(29,158,217,0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "flow-dash": "flow-dash 12s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
