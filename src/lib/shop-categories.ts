/**
 * The reference app's Shop category filter — a hardcoded Title Case list
 * (the live dropdown renders All Categories / Equipment / Supplements /
 * Accessories / Apparel regardless of the catalog's actual categories).
 * Pinned by src/lib/shop-categories.test.ts.
 */

export const SHOP_CATEGORIES = [
  "Equipment",
  "Supplements",
  "Accessories",
  "Apparel",
] as const;

/** "all" passes; otherwise case-insensitive equality (seed stores lowercase). */
export function categoryMatches(productCategory: string, filter: string): boolean {
  if (filter === "all") return true;
  return productCategory.toLowerCase() === filter.toLowerCase();
}
