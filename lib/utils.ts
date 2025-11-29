import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTierFromScore(score: number): string {
  if (score >= 95) return "S";
  if (score >= 86) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  return "F";
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    S: "text-tier-s",
    A: "text-tier-a",
    B: "text-tier-b",
    C: "text-tier-c",
    D: "text-tier-d",
    F: "text-tier-f",
  };
  return colors[tier] || "text-muted-foreground";
}

export function getTierBgColor(tier: string): string {
  const colors: Record<string, string> = {
    S: "bg-tier-s/20 border-tier-s",
    A: "bg-tier-a/20 border-tier-a",
    B: "bg-tier-b/20 border-tier-b",
    C: "bg-tier-c/20 border-tier-c",
    D: "bg-tier-d/20 border-tier-d",
    F: "bg-tier-f/20 border-tier-f",
  };
  return colors[tier] || "bg-muted border-muted-foreground";
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
