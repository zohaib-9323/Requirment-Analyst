/** @type {import('tailwindcss').Config} */

// Colors are CSS variables (RGB triplets) defined in globals.css so the
// light/dark theme can switch without any Tailwind `dark:` variants.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        subtle: token("subtle"),
        accent: token("accent"),
        "accent-fg": token("accent-fg"),
        "accent-soft": token("accent-soft"),
        cat: {
          missing: token("cat-missing"),
          ambiguous: token("cat-ambiguous"),
          edge: token("cat-edge"),
          technical: token("cat-technical"),
          business: token("cat-business"),
        },
        danger: token("danger"),
        success: token("success"),
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)",
        lift: "0 2px 4px rgb(0 0 0 / 0.04), 0 12px 32px -8px rgb(0 0 0 / 0.14)",
      },
    },
  },
  plugins: [],
};

module.exports = config;
