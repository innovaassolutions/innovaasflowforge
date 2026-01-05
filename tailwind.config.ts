import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ============================================
         Pearl Vibrant Theme Colors
         Reference: docs/design-system.md
         ============================================ */
      colors: {
        /* ------------------------------------------------
           FlowForge Design System Tokens (Direct Hex)
           Use these for explicit color values:
           - bg-ff-bg, bg-ff-subtle, bg-ff-muted
           - text-ff-text, text-ff-muted
           - border-ff-border
           - bg-ff-accent, hover:bg-ff-accent-hover
           ------------------------------------------------ */
        ff: {
          /* Backgrounds */
          bg: "#FFFEFB",
          subtle: "#FAF8F3",
          muted: "#F2EFE7",
          /* Text */
          text: "#171614",
          "text-muted": "#71706B",
          /* Borders */
          border: "#E6E2D6",
          /* Accent (Orange) */
          accent: "#F25C05",
          "accent-hover": "#DC5204",
          "accent-subtle": "#FEF5EE",
          /* Status */
          success: "#16A34A",
          "success-subtle": "#DCFCE7",
          warning: "#CA8A04",
          "warning-subtle": "#FEF9C3",
          /* Teal */
          teal: "#1D9BA3",
          "teal-dark": "#14737A",
        },

        /* Legacy brand namespace (prefer ff.*) */
        brand: {
          orange: "#F25C05",
          "orange-dark": "#DC5204",
          teal: "#1D9BA3",
          "teal-dark": "#14737A",
        },

        /* ------------------------------------------------
           Dynamic Brand Colors (CSS Variables)
           Used by /coach/[slug]/ pages for white-label theming.
           Values are injected at runtime from tenant_profiles.brand_config
           Story: 3-2-branding-infrastructure
           ------------------------------------------------ */
        "brand-primary": "var(--brand-primary)",
        "brand-primary-hover": "var(--brand-primary-hover)",
        "brand-secondary": "var(--brand-secondary)",
        "brand-bg": "var(--brand-bg)",
        "brand-bg-subtle": "var(--brand-bg-subtle)",
        "brand-text": "var(--brand-text)",
        "brand-text-muted": "var(--brand-text-muted)",
        "brand-border": "var(--brand-border)",

        /* shadcn/ui CSS Variable Colors */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          subtle: "hsl(var(--accent-subtle))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          subtle: "hsl(var(--destructive-subtle))",
        },

        /* Semantic Status Colors */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          subtle: "hsl(var(--success-subtle))",
        },

        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          subtle: "hsl(var(--warning-subtle))",
        },

        /* Structural Colors */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* Chart Colors */
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        /* Legacy Mocha Colors (deprecated - for migration only) */
        mocha: {
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
          surface0: "#313244",
          surface1: "#45475a",
          surface2: "#585b70",
          overlay0: "#6c7086",
          overlay1: "#7f849c",
          overlay2: "#9399b2",
          text: "#cdd6f4",
          subtext1: "#bac2de",
          subtext0: "#a6adc8",
          green: "#a6e3a1",
          yellow: "#f9e2af",
          red: "#f38ba8",
          sky: "#89dceb",
        },
      },

      /* ============================================
         Border Radius Scale
         ============================================ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },

      /* ============================================
         Typography
         ============================================ */
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        /* Dynamic brand fonts for white-label theming (Story: 3-2) */
        "brand-heading": "var(--brand-font-heading)",
        "brand-body": "var(--brand-font-body)",
      },

      /* ============================================
         Spacing Scale (from UX spec)
         ============================================ */
      spacing: {
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
      },

      /* ============================================
         Box Shadow Scale
         ============================================ */
      boxShadow: {
        soft: "0 4px 24px rgba(0, 0, 0, 0.08)",
        "soft-lg": "0 8px 32px rgba(0, 0, 0, 0.12)",
      },

      /* ============================================
         Animation Keyframes
         ============================================ */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
