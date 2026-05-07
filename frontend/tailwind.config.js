/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf6",
          100: "#d7f5e7",
          200: "#b2ebd0",
          300: "#7fdbb1",
          400: "#49c68e",
          500: "#22ab73",
          600: "#178a5d",
          700: "#146e4d",
          800: "#14573f",
          900: "#124734"
        }
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: []
};
