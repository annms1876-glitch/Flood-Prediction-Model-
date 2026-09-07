/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flood: {
          normal: "#22c55e",
          watch: "#eab308",
          warning: "#f97316",
          high: "#ef4444",
          critical: "#7f1d1d",
        },
        brand: {
          dark: "#0a0e1a",
          card: "#111827",
          accent: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

module.exports = config;
