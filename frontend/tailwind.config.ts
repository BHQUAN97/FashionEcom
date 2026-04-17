import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Quicksand", "sans-serif"],
      },
      fontSize: {
        xs: ["14px", { lineHeight: "1.4" }],
        sm: ["15px", { lineHeight: "1.5" }],
        base: ["15px", { lineHeight: "1.6" }],
        lg: ["17px", { lineHeight: "1.5" }],
        xl: ["19px", { lineHeight: "1.4" }],
        "2xl": ["22px", { lineHeight: "1.35" }],
        "3xl": ["26px", { lineHeight: "1.3" }],
        "4xl": ["30px", { lineHeight: "1.25" }],
        "5xl": ["36px", { lineHeight: "1.2" }],
        "6xl": ["42px", { lineHeight: "1.15" }],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        // Design system — Torano style
        fashion: {
          black: "#1a1a1a",
          red: "#d60000",
          white: "#FFFFFF",
          text: "#333333",
          muted: "#6B7280",
          hover: "#d60000",
          border: "#e7e7e7",
          bg: "#f5f5f5",
        },
        topbar: {
          DEFAULT: "#242021",
          text: "#ffffff",
        },
        flashsale: {
          bg: "#faefec",
          countdown: "#d60000",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      outlineColor: {
        DEFAULT: "var(--ring)",
      },
      screens: {
        // Mobile-first breakpoints (Torano: 767/991/1199/1200)
        sm: "375px",
        md: "768px",
        lg: "992px",
        xl: "1200px",
        "2xl": "1600px",
      },
      maxWidth: {
        container: "1600px",
      },
    },
  },
  plugins: [
    // scrollbar-hide utility
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".safe-area-pb": {
          "padding-bottom": "env(safe-area-inset-bottom)",
        },
      });
    }),
  ],
};
export default config;
