import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Inspire Associates Brand Colors
        brand: {
          navy: "#1a2c5b",      // Dark Arrow & "Inspire" text
          navyHover: "#121f42",
          sky: "#0284c7",       // Light Arrow & Accent
          skyLight: "#e0f2fe",  // Light Cyan tint for cards/badges
          gray: "#64748b",      // "Associates" & Tagline gray
          border: "#e2e8f0",    // Clean subtle light borders
          bg: "#f8fafc",        // Off-white soft dashboard background
        },
      },
    },
  },
  plugins: [],
};
export default config;