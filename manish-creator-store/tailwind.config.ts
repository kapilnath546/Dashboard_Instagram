import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: [
          "var(--font-bricolage)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        /* ── Brand colours ─────────────────────────── */
        cream:           "hsl(var(--cream))",
        white:           "hsl(var(--white))",
        charcoal: {
          DEFAULT:       "hsl(var(--charcoal))",
          deep:          "hsl(var(--charcoal-deep))",
        },
        body:            "hsl(var(--body))",
        muted:           "hsl(var(--muted))",
        accent: {
          DEFAULT:       "hsl(var(--accent))",
          hover:         "hsl(var(--accent-hover))",
          foreground:    "hsl(var(--accent-foreground))",
        },
        border:          "hsl(var(--border))",

        /* Category tints */
        "cat-grooming":  "hsl(var(--cat-grooming))",
        "cat-fashion":   "hsl(var(--cat-fashion))",
        "cat-fitness":   "hsl(var(--cat-fitness))",
        "cat-amazon":    "hsl(var(--cat-amazon))",

        /* Admin sidebar */
        "sidebar-bg":    "hsl(var(--sidebar-bg))",
        "sidebar-text":  "hsl(var(--sidebar-text))",
        "sidebar-active":"hsl(var(--sidebar-active))",

        /* ── Shadcn-compatible tokens ──────────────── */
        background:      "hsl(var(--background))",
        foreground:      "hsl(var(--foreground))",
        card: {
          DEFAULT:       "hsl(var(--card))",
          foreground:    "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:       "hsl(var(--popover))",
          foreground:    "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:       "hsl(var(--primary))",
          foreground:    "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:       "hsl(var(--secondary))",
          foreground:    "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:       "hsl(var(--destructive))",
          foreground:    "hsl(var(--destructive-foreground))",
        },
        ring:            "hsl(var(--ring))",
        input:           "hsl(var(--input))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        site: "1200px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
