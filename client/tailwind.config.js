/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
  extend: {
    colors: {
      mint: "#E4F2EA", // updated background color
      navy: "#0C243C",
      aqua: "#8ADAB2",
      yellow: "#FFD580",
    },
  },
},
  plugins: [],
};
