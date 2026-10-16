import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

/** Warna berbasis CSS variable (format "R G B") agar mendukung dark mode & opacity modifier. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: v("border"),
        input: v("input"),
        ring: v("ring"),
        background: v("background"),
        foreground: v("foreground"),
        surface: v("surface"),
        ink: v("ink"),
        card: { DEFAULT: v("card"), foreground: v("card-foreground") },
        popover: { DEFAULT: v("popover"), foreground: v("popover-foreground") },
        muted: { DEFAULT: v("muted"), foreground: v("muted-foreground") },
        // Brand. DEFAULT = warna adaptif (ikon/teks/aksen), 600 = muka tombol solid (kontras AA dgn teks putih), 700 = sisi "tekan".
        primary: { DEFAULT: v("primary"), foreground: v("primary-foreground"), 600: v("primary-600"), 700: v("primary-700") },
        secondary: { DEFAULT: v("secondary"), foreground: v("secondary-foreground"), 600: v("secondary-600"), 700: v("secondary-700") },
        accent: { DEFAULT: v("accent"), foreground: v("accent-foreground"), 600: v("accent-600"), 700: v("accent-700") },
        danger: { DEFAULT: v("danger"), foreground: v("danger-foreground"), 700: v("danger-700") },
        destructive: { DEFAULT: v("danger"), foreground: v("danger-foreground") },
        success: { DEFAULT: v("success"), foreground: v("success-foreground"), 700: v("success-700") },
        // Warna kategori fitur
        belajar: { DEFAULT: v("c-belajar"), solid: "#1A7A43", deep: "#145C33" },
        budaya: { DEFAULT: v("c-budaya"), solid: "#7E3AF2", deep: "#5B21B6" },
        asisten: { DEFAULT: v("c-asisten"), solid: "#0E7C7B", deep: "#0A5958" },
        komunitas: { DEFAULT: v("c-komunitas"), solid: "#B91C1C", deep: "#7F1D1D" },
        progres: { DEFAULT: v("c-progres"), solid: "#D97706", deep: "#92400E" },
      },
      opacity: { 6: "0.06", 8: "0.08", 12: "0.12", 15: "0.15" },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(28 25 23 / 0.04), 0 4px 16px -4px rgb(28 25 23 / 0.08)",
        lift: "0 2px 4px rgb(28 25 23 / 0.06), 0 12px 32px -8px rgb(28 25 23 / 0.14)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--primary) / 0.45)" },
          "70%": { boxShadow: "0 0 0 14px rgb(var(--primary) / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(var(--primary) / 0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shake: "shake 0.4s ease-in-out",
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 5.5s ease-in-out infinite",
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
