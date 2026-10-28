import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);
}

export function getStockStatus(qty: number): {
  label: string;
  color: string;
} {
  if (qty === 0) return { label: "Out of Stock", color: "text-red-500" };
  if (qty <= 3) return { label: `Low Stock (${qty} left)`, color: "text-orange-500" };
  return { label: `In Stock (${qty})`, color: "text-green-500" };
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All Products",
  tcg: "Trading Card Games",
  collectibles: "Collectibles",
  consoles: "Consoles",
  games: "Games",
  f_and_b: "Snacks & Drinks",
};

export const CATEGORY_ICONS: Record<string, string> = {
  all: "🛍️",
  tcg: "🃏",
  collectibles: "🏆",
  consoles: "🎮",
  games: "🕹️",
  f_and_b: "🍜",
};
