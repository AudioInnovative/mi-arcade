// Profile themes for creator customization
export interface Theme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_variant: string;
}

export const THEMES: Theme[] = [
  {
    id: "neon-cyan",
    name: "Neon Cyan",
    primary_color: "#00f5ff",
    secondary_color: "#a855f7",
    accent_color: "#00f5ff",
    background_variant: "neon",
  },
  {
    id: "galaxy-purple",
    name: "Galaxy Purple",
    primary_color: "#a855f7",
    secondary_color: "#ec4899",
    accent_color: "#c084fc",
    background_variant: "galaxy",
  },
  {
    id: "pixel-green",
    name: "Pixel Green",
    primary_color: "#22c55e",
    secondary_color: "#10b981",
    accent_color: "#4ade80",
    background_variant: "pixel",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary_color: "#f97316",
    secondary_color: "#ef4444",
    accent_color: "#fb923c",
    background_variant: "warm",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary_color: "#3b82f6",
    secondary_color: "#06b6d4",
    accent_color: "#60a5fa",
    background_variant: "ocean",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    primary_color: "#f43f5e",
    secondary_color: "#ec4899",
    accent_color: "#fb7185",
    background_variant: "rose",
  },
  {
    id: "electric-yellow",
    name: "Electric Yellow",
    primary_color: "#eab308",
    secondary_color: "#f97316",
    accent_color: "#facc15",
    background_variant: "electric",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    primary_color: "#14b8a6",
    secondary_color: "#22c55e",
    accent_color: "#2dd4bf",
    background_variant: "fresh",
  },
  {
    id: "crimson-dark",
    name: "Crimson Dark",
    primary_color: "#dc2626",
    secondary_color: "#991b1b",
    accent_color: "#ef4444",
    background_variant: "dark",
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    primary_color: "#1f2937",
    secondary_color: "#6b7280",
    accent_color: "#374151",
    background_variant: "minimal",
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function getThemeStyles(theme: Theme) {
  return {
    "--theme-primary": theme.primary_color,
    "--theme-secondary": theme.secondary_color,
    "--theme-accent": theme.accent_color,
  } as React.CSSProperties;
}
