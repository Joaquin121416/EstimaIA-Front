/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: "#0F2B4E", light: "#1A3A5C" },
        brand: { DEFAULT: "#1A5FAD", light: "#2E7DD4", xlight: "#EBF4FF" },
        gold:  { DEFAULT: "#C8973A", light: "#F0B94A" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
