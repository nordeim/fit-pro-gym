import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a price as "$12.00" / "$0.01" — the reference shows raw numbers. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Cart total: sum(price * quantity) with float-safe rounding to cents. */
export function cartTotal(items: { price: number; quantity: number }[]): number {
  const cents = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
  return cents / 100;
}

/** Maps an item to the Order line shape of the reference app. */
export function toOrderLine(item: {
  itemName: string;
  itemType: string;
  price: number;
  quantity: number;
}) {
  return { name: item.itemName, type: item.itemType, price: item.price, quantity: item.quantity };
}
