import type { Config } from "tailwindcss";

// Academic indigo / scholarship-gold palette — keep in sync with
// packages/shared/src/theme.ts (light tokens) and apps/admin's copy of this
// file. "2"-suffixed tokens are the dark-mode counterpart of the token
// without it, applied via Tailwind's `dark:` variant (prefers-color-scheme).
const config: Config = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F5F1",
        bg2: "#171B26",
        bgAlt: "#ECEAE2",
        bgAlt2: "#1D2230",
        surface: "#FFFFFF",
        surface2: "#202537",
        text: "#232B3B",
        text2: "#E7E9F0",
        textMuted: "#5C6478",
        textMuted2: "#A7ADC0",
        primary: "#2E4374",
        primary2: "#7C97D6",
        primaryDark: "#1D2C4E",
        primaryLight: "#9AACD1",
        primaryLight2: "#2A3B63",
        accent: "#C99A3A",
        accent2: "#E3B75C",
        accentLight: "#EFDDAF",
        accentLight2: "#4A3B1A",
        success: "#2E8B57",
        success2: "#4FBE82",
        warning: "#C99A3A",
        warning2: "#E3B75C",
        danger: "#B3453B",
        danger2: "#E07268",
        border: "#DCD8CC",
        border2: "#313850",
        featuredBadgeBg: "#FCEFCB",
        featuredBadgeBg2: "#4A3B1A",
        featuredBadgeText: "#8A6410",
        featuredBadgeText2: "#E3B75C",
        statusPendingBg: "#FCEFCB",
        statusPendingBg2: "#4A3B1A",
        statusPendingText: "#8A6410",
        statusPendingText2: "#E3B75C",
        statusPublishedBg: "#DCEEE1",
        statusPublishedBg2: "#1F3A2B",
        statusPublishedText: "#256C46",
        statusPublishedText2: "#6FCB9B",
        statusRejectedBg: "#F6DDD9",
        statusRejectedBg2: "#3E211D",
        statusRejectedText: "#8A2E22",
        statusRejectedText2: "#E28A7B",
        statusExpiredBg: "#E7E5DD",
        statusExpiredBg2: "#2B2E38",
        statusExpiredText: "#6B6A63",
        statusExpiredText2: "#A7A69D",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
