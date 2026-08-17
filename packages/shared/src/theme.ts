// Light-mode palette — source of truth referenced (not imported) by each
// Tailwind config's dark-token pairs, same convention as deal-aggregator's
// theme.ts. Academic indigo + scholarship gold, distinct from BandingHarga's
// sage/sand/charcoal.

export const colors = {
  bg: "#F6F5F1",
  bgAlt: "#ECEAE2",
  surface: "#FFFFFF",
  text: "#232B3B",
  textMuted: "#5C6478",
  primary: "#2E4374",
  primaryDark: "#1D2C4E",
  primaryLight: "#9AACD1",
  accent: "#C99A3A",
  accentLight: "#EFDDAF",
  success: "#2E8B57",
  warning: "#C99A3A",
  danger: "#B3453B",
  border: "#DCD8CC",
  featuredBadgeBg: "#FCEFCB",
  featuredBadgeText: "#8A6410",
  statusPendingBg: "#FCEFCB",
  statusPendingText: "#8A6410",
  statusPublishedBg: "#DCEEE1",
  statusPublishedText: "#256C46",
  statusRejectedBg: "#F6DDD9",
  statusRejectedText: "#8A2E22",
  statusExpiredBg: "#E7E5DD",
  statusExpiredText: "#6B6A63",
} as const;

export const radius = { sm: 6, md: 10, lg: 16 } as const;
