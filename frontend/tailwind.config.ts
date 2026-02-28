import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffc",
          300: "#7cc6fa",
          400: "#36aaf5",
          500: "#0c8ee6",
          600: "#0070c4",
          700: "#01599f",
          800: "#064c83",
          900: "#0b406d",
          950: "#072949",
        },
        accent: {
          50: "#fdf4f3",
          100: "#fce8e4",
          200: "#fad5ce",
          300: "#f5b6ab",
          400: "#ed8c79",
          500: "#e0654e",
          600: "#cc4a31",
          700: "#ab3b25",
          800: "#8d3422",
          900: "#752f22",
          950: "#40150d",
        },
        surface: {
          50: "#f8f9fb",
          100: "#f0f2f5",
          200: "#e4e7ed",
          300: "#d1d5df",
          400: "#b7bccc",
          500: "#9da3b7",
          600: "#888ea5",
          700: "#747a91",
          800: "#606577",
          900: "#505462",
          950: "#1a1b23",
        },
        earth: {
          50: "#faf6f0",
          100: "#f2eadb",
          200: "#e5d3b5",
          300: "#d4b58a",
          400: "#c69965",
          500: "#bb8450",
          600: "#ad6f44",
          700: "#905739",
          800: "#754734",
          900: "#603c2d",
          950: "#331e16",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.12)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.16)",
        glow: "0 0 24px rgba(12, 142, 230, 0.15)",
        "glow-accent": "0 0 24px rgba(224, 101, 78, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(12, 142, 230, 0.1)" },
          "50%": { boxShadow: "0 0 24px rgba(12, 142, 230, 0.25)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
