/**
 * =================================================================================
 * |
 * |   ECHO_MIND ELITE DESIGN SYSTEM (EDS) - tailwind.config.ts
 * |   ---------------------------------------------------------------------------
 * |   Premium-tailored Tailwind config with robust safelisting for dynamic classes
 * |   (including gradient stops + alpha), semantic CSS-variable colors, and
 * |   thoughtful DX touches. Safe for prod builds with dynamic theming.
 * |
 * =================================================================================
 * @type {import('tailwindcss').Config}
 */
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import formsPlugin from "@tailwindcss/forms";

/**
 * ---- Safelist Patterns (carefully constructed) ---------------------------------
 * We cover:
 *  - gradient directions (bg-gradient-to-*)
 *  - gradient stops: from|via|to-(color)-(shade?)/(alpha?)
 *  - solid color utilities: bg|text|border|ring|stroke|fill-(color)-(shade?)/(alpha?)
 *  - animation utilities used dynamically
 *
 * Notes:
 *  - Colors that DO NOT take shades (black|white|transparent|current) are handled
 *    with a separate pattern so `to-black` works and `to-black-500` won’t be required.
 *  - Alpha fractions support common steps: 0,5,10,20,25,30,40,50,60,70,75,80,90,95,100.
 *  - If you add new theme colors, include them below for bulletproof safelisting.
 */

const SHADE = "(50|100|200|300|400|500|600|700|800|900|950)";
const ALPHA = "(?:\\/(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100))?";

// Tailwind palette names that commonly use shades:
const SHADED_COLORS =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
// Colors that typically don't use numeric shades:
const UNSHADED_COLORS = "black|white|transparent|current";

// Build regexes at runtime for clarity & maintainability
const gradientDirectionRe = /bg-gradient-to-(r|l|t|b|tr|tl|br|bl)/;

// from|via|to for shaded colors with optional alpha
const gradientStopsShadedRe = new RegExp(
  `(?:from|via|to)-(?:${SHADED_COLORS})-${SHADE}${ALPHA}`
);

// from|via|to for unshaded colors with optional alpha (e.g., to-black, via-white/50)
const gradientStopsUnshadedRe = new RegExp(
  `(?:from|via|to)-(?:${UNSHADED_COLORS})${ALPHA}`
);

// Solid color utilities for shaded colors (bg/text/border/ring/stroke/fill)
const solidShadedRe = new RegExp(
  `(?:bg|text|border|ring|stroke|fill)-(?:${SHADED_COLORS})-${SHADE}${ALPHA}`
);

// Solid color utilities for unshaded colors
const solidUnshadedRe = new RegExp(
  `(?:bg|text|border|ring|stroke|fill)-(?:${UNSHADED_COLORS})${ALPHA}`
);

// Commonly dynamic animation utility classes
const animationsRe =
  /animate-(fade-in|slide-up|pulse-glow|pulse-slow|bounce-sm)/;

export default {
  darkMode: "class",

  // Make sure all locations where classes might appear are scanned.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Bulletproof safelist for dynamic classes
  safelist: [
    { pattern: gradientDirectionRe },
    { pattern: gradientStopsShadedRe },
    { pattern: gradientStopsUnshadedRe },
    { pattern: solidShadedRe },
    { pattern: solidUnshadedRe },
    { pattern: animationsRe },
    // If you ever construct direction classes dynamically (e.g., 'bg-gradient-to-tr' via props),
    // the pattern above already covers them. Add more here only if you introduce new dynamic families.
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
    },
    extend: {
      // =======================================================================
      //  🎨 Semantic Color Roles (CSS variables for automatic light/dark)
      // =======================================================================
      colors: {
        // Semantic roles (backed by CSS vars set in your index.css / theme)
        background: "hsl(var(--color-background) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        primary: "hsl(var(--color-primary) / <alpha-value>)",
        secondary: "hsl(var(--color-secondary) / <alpha-value>)",
        accent: "hsl(var(--color-accent) / <alpha-value>)",

        // Feedback roles
        success: "hsl(var(--color-success) / <alpha-value>)",
        danger: "hsl(var(--color-danger) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",

        // Text roles
        "text-primary": "hsl(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "hsl(var(--color-text-secondary) / <alpha-value>)",
        "text-muted": "hsl(var(--color-text-muted) / <alpha-value>)",

        // Border roles
        border: "hsl(var(--color-border) / <alpha-value>)",
        "border-interactive":
          "hsl(var(--color-border-interactive) / <alpha-value>)",
      },

      // =======================================================================
      //  🖋️ Typography
      // =======================================================================
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      // =======================================================================
      //  📐 Radii (CSS variables keep design tokens centralized)
      // =======================================================================
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl, 1rem)", // opt-in extra token if provided
        "2xl": "var(--radius-2xl, 1.5rem)",
      },

      // =======================================================================
      //  ✨ Motion & Animation Utilities
      // =======================================================================
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px -3px hsl(var(--color-accent) / 0)",
          },
          "50%": { boxShadow: "0 0 15px -3px hsl(var(--color-accent) / 0.5)" },
        },
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.1" },
          "50%": { transform: "scale(1.1)", opacity: "0.15" },
        },
        "bounce-sm": {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-15%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "pulse-glow": "pulse-glow 2.5s infinite",
        "pulse-slow": "pulse-slow 8s infinite ease-in-out",
        "bounce-sm": "bounce-sm 1s infinite",
      },

      // Optional: expose timing tokens via CSS variables if you want to centralize them
      transitionTimingFunction: {
        fast: "var(--transition-fast, cubic-bezier(0.2, 0.8, 0.2, 1))",
        medium: "var(--transition-medium, cubic-bezier(0.25, 1, 0.5, 1))",
      },
    },
  },

  // Plugins
  plugins: [
    formsPlugin, // normalized form controls
    tailwindcssAnimate,
  ],
} satisfies Config;