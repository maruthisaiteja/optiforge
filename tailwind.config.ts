import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0B0F1A",
          secondary: "#131A2B",
          card: "#161F36",
          elevated: "#1C2744",
        },
        navy: {
          deep: "#1F2A63",
          border: "#263566",
        },
        teal: {
          accent: "#2FE6D6",
          glow: "rgba(47, 230, 214, 0.25)",
        },
        orange: {
          accent: "#E15A2C",
        },
        electric: {
          violet: "#7B5CFA",
          glow: "rgba(123, 92, 250, 0.25)",
        },
        brand: {
          white: "#F5F7FA",
          muted: "#8B93A7",
          dim: "#55607A",
        },
        status: {
          green: "#3ED598",
          red: "#FF5C5C",
          yellow: "#FFB020",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-signature": "linear-gradient(135deg, #2FE6D6 0%, #7B5CFA 100%)",
        "gradient-orange": "linear-gradient(135deg, #E15A2C 0%, #FF8A00 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(31, 42, 99, 0.4) 0%, rgba(19, 26, 43, 0.8) 100%)",
        "gradient-glow": "radial-gradient(circle at 50% 50%, rgba(47, 230, 214, 0.15) 0%, rgba(11, 15, 26, 0) 70%)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(47, 230, 214, 0.35)",
        "glow-violet": "0 0 24px rgba(123, 92, 250, 0.35)",
        "glow-orange": "0 0 24px rgba(225, 90, 44, 0.35)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
