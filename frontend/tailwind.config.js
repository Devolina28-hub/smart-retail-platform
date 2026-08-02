/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#06B6D4",
        accent: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        surfaceDark: "#0F172A",
        surfaceLight: "#F8FAFC",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)",
        "gradient-accent": "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(15, 23, 42, 0.15)",
        glow: "0 0 40px -8px rgba(37, 99, 235, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
