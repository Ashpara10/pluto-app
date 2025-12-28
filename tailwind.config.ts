import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // adjust as needed
  ],
  theme: {
    extend: {
      colors: {
        dark: "#181818",
        darkBorder: "#242424",
        "light-dark": "#303030",
        "light-dark-border": "#424242",
        "dark-popover": "#151515",
        black: "#0E0E0E",
        darkBlue: "#04181F",
        gray: "#363637",
        teal: "#1C4A5A",
        cyan: "#55D3D2",
        darkCyan: "#1C4A5A",
        darkGray: "#C0BDC5",
        lightGray: "#DCDADE",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        instrument: ["var(--font-instrument)"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
} satisfies Config;
