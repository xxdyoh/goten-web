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
        primary: {
          DEFAULT: "#3B6DF0",
          50: "#EEF2FE",
          600: "#2F5BE0",
          700: "#2446B8",
        },
        success: {
          DEFAULT: "#00A86B",
          50: "#E4F7F0",
          600: "#00855A",
          700: "#006B48",
        },
        warning: {
          DEFAULT: "#FF8C42",
          50: "#FFF3E8",
          700: "#B45309",
        },
        danger: {
          DEFAULT: "#FF5E62",
          50: "#FFEEEE",
          600: "#E5484D",
          700: "#C0392B",
        },
        bg: "#F0F4FF",
        ink: "#1A2233",
        "ink-soft": "#4B5563",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;