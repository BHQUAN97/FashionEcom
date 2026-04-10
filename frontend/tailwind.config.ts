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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design system — Torano style
        fashion: {
          black: "#1a1a1a",
          red: "#D0021B",
          white: "#FFFFFF",
          text: "#333333",
          muted: "#6B7280",
        },
      },
      screens: {
        // Mobile-first breakpoints
        sm: "375px",
        md: "768px",
        lg: "1280px",
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
