import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        card: "var(--color-card)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        gold: "var(--color-gold)",
        moss: "var(--color-moss)",
        clay: "var(--color-clay)",
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
