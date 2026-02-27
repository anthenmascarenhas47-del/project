/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 25px rgba(16,185,129,0.35)",
        neonStrong: "0 0 60px rgba(16,185,129,0.55)",
        purpleGlow: "0 0 80px rgba(16,185,129,0.35)",
      },
    },
  },
  plugins: [],
};