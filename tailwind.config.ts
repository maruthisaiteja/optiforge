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
          primary: "#F8FAFC",      // $.bg
          secondary: "#F0F7FB",    // $.softBlue
          card: "#FFFFFF",         // $.white
          elevated: "#FFFFFF",
        },
        navy: {
          deep: "#F0F7FB",         // Soft Blue for neutral badge/input backgrounds
          border: "#D9E6EE",       // $.border
        },
        teal: {
          accent: "#00629B",       // $.ieeeBlue
          glow: "rgba(0, 98, 155, 0.15)",
        },
        cyan: {
          accent: "#12A8C4",       // $.cyan
        },
        orange: {
          accent: "#D58A19",       // $.warning
        },
        electric: {
          violet: "#772583",       // $.embsPurple
          glow: "rgba(119, 37, 131, 0.15)",
        },
        brand: {
          white: "#102A43",        // $.navy (main text)
          muted: "#52606D",        // $.slate (secondary text)
          dim: "#829AB1",
        },
        status: {
          green: "#238B68",        // $.success
          red: "#D84A5A",          // $.medRed
          yellow: "#D58A19",       // $.warning
        },
        // Exact tokens imported from https://ieee-embs-vce.vercel.app/optiforge
        ofBg: "#F8FAFC",
        ofWhite: "#FFFFFF",
        ofSoftBlue: "#F0F7FB",
        ofSoftPurple: "#F6F1F8",
        ieeeBlue: "#00629B",
        embsPurple: "#772583",
        ofCyan: "#12A8C4",
        ofNavy: "#102A43",
        ofSlate: "#52606D",
        ofBorder: "#D9E6EE",
        ofSuccess: "#238B68",
        ofWarning: "#D58A19",
        ofMedRed: "#D84A5A",
        ofAiPurple: "#7657D9",
      },
      fontFamily: {
        display: ["Sora", "Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-signature": "linear-gradient(135deg, #00629B 0%, #772583 100%)",
        "gradient-teal-blue": "linear-gradient(135deg, #008C95 0%, #0066CC 100%)",
        "gradient-card": "linear-gradient(180deg, #FFFFFF 0%, #F0F7FB 100%)",
        "gradient-hero": "linear-gradient(135deg, #F8FAFC 0%, #EEF8FC 50%, #F7F0F9 100%)",
        "gradient-glow": "radial-gradient(circle at 50% 50%, rgba(18, 168, 196, 0.15) 0%, rgba(248, 250, 252, 0) 70%)",
      },
      boxShadow: {
        glow: "0 4px 20px rgba(0, 98, 155, 0.15)",
        "glow-violet": "0 4px 20px rgba(119, 37, 131, 0.15)",
        "glow-cyan": "0 4px 20px rgba(18, 168, 196, 0.20)",
        card: "0 1px 3px rgba(23,33,33,.06), 0 4px 16px -2px rgba(23,33,33,.06)",
        bright: "0 4px 20px -2px rgba(0,98,155,.08), 0 2px 6px -1px rgba(0,0,0,.04)",
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
