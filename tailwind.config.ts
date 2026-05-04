import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // HIE Design System
        "hie-blue":   "#1A6BFF",
        "hie-green":  "#16A34A",
        "hie-amber":  "#D97706",
        "hie-red":    "#DC2626",
        "hie-bg-1":   "#FFFFFF",
        "hie-bg-2":   "#F8F8F7",
        "hie-bg-3":   "#F1F0ED",
        "hie-text-1": "#1A1A18",
        "hie-text-2": "#6B6A66",
        "hie-text-3": "#9B9A96",
        "hie-border": "#E5E4E0",
      },
      borderRadius: {
        input: "6px",
        card:  "8px",
        modal: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
