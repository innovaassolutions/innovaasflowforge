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
        // Innovaas Brand Colors (Primary Identity)
        brand: {
          orange: "#F25C05", // Primary brand color - CTAs, highlights
          "orange-dark": "#D94C04", // Hover states
          teal: "#1D9BA3", // Secondary brand color - links, info
          "teal-dark": "#14737A", // Hover states
        },

        // Catppuccin Mocha Base Colors (Backgrounds & Surfaces)
        mocha: {
          // Base colors - main backgrounds
          base: "#1e1e2e", // Main background
          mantle: "#181825", // Slightly darker than base
          crust: "#11111b", // Darkest background

          // Surface colors - cards, modals, elevated elements
          surface0: "#313244",
          surface1: "#45475a",
          surface2: "#585b70",

          // Overlay colors - borders, dividers
          overlay0: "#6c7086",
          overlay1: "#7f849c",
          overlay2: "#9399b2",

          // Text colors
          text: "#cdd6f4", // Primary text
          subtext1: "#bac2de", // Secondary text
          subtext0: "#a6adc8", // Tertiary text

          // Catppuccin accent colors (for additional UI elements)
          rosewater: "#f5e0dc",
          flamingo: "#f2cdcd",
          pink: "#f5c2e7",
          mauve: "#cba6f7",
          red: "#f38ba8",
          maroon: "#eba0ac",
          peach: "#fab387",
          yellow: "#f9e2af",
          green: "#a6e3a1",
          teal: "#94e2d5",
          sky: "#89dceb",
          sapphire: "#74c7ec",
          blue: "#89b4fa",
          lavender: "#b4befe",
        },

        // Blended color scheme for specific use cases
        background: {
          DEFAULT: "#1e1e2e", // mocha.base
          dark: "#11111b", // mocha.crust
          elevated: "#313244", // mocha.surface0
        },

        foreground: {
          DEFAULT: "#cdd6f4", // mocha.text
          muted: "#bac2de", // mocha.subtext1
          subtle: "#a6adc8", // mocha.subtext0
        },

        // Semantic colors (status indicators)
        success: "#a6e3a1", // mocha.green
        warning: "#f9e2af", // mocha.yellow
        error: "#f38ba8", // mocha.red
        info: "#89dceb", // mocha.sky

        // Chart colors (blend of both palettes)
        chart: {
          primary: "#F25C05", // Innovaas orange
          secondary: "#1D9BA3", // Innovaas teal
          1: "#fab387", // Catppuccin peach
          2: "#89b4fa", // Catppuccin blue
          3: "#a6e3a1", // Catppuccin green
          4: "#cba6f7", // Catppuccin mauve
          5: "#f5c2e7", // Catppuccin pink
          6: "#94e2d5", // Catppuccin teal
        },
      },
    },
  },
  plugins: [],
};
export default config;
