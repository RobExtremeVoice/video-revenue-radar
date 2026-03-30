import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function getCategoryColor(category: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    Tops: { bg: "bg-primary-light text-primary", text: "text-primary" },
    Bottoms: { bg: "bg-teal-light text-teal", text: "text-teal" },
    Dresses: { bg: "bg-amber-light text-amber", text: "text-amber" },
    Footwear: { bg: "bg-coral-light text-coral", text: "text-coral" },
    Accessories: { bg: "bg-primary-light text-primary", text: "text-primary" },
    Outerwear: { bg: "bg-teal-light text-teal", text: "text-teal" },
    Swimwear: { bg: "bg-amber-light text-amber", text: "text-amber" },
  };
  return map[category] || { bg: "bg-muted text-muted-foreground", text: "text-muted-foreground" };
}
