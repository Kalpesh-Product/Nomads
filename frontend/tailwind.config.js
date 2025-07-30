/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "375px",
        tab: "1023px",
      },
      colors: {
        primary: {
          DEFAULT: "#FAFAFA",
          light: "#3b82f6",
          dark: "#1e40af",
          blue: "rgb(80, 186, 232)",
        },
        secondary: {
          DEFAULT: "#202020",
          light: "#94a3b8",
          dark: "#475569",
        },
        accent: "#f4ed4f",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
        mono: ["Fira Code", "ui-monospace"],
        hero:["Bebas Neue", "ui-sans-serif", "system-ui"]
      },
      fontSize: {
        tiny: ["0.75rem", { lineHeight: "1rem" }], // ~12px
        content: ["1rem", { lineHeight: "1.5rem" }], // 16px
        subtitle: ["1.25rem", { lineHeight: "1.75rem" }], // ~20px
        title: ["1.5rem", { lineHeight: "2rem" }], // ~24px
        hero: ["3rem", { lineHeight: "1" }], // 48px
      },
      // etc...
    },
  },
};
