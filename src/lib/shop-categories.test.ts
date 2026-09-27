import { describe, expect, it } from "vitest";

import { SHOP_CATEGORIES, categoryMatches } from "./shop-categories";

/**
 * The reference app's category filter is a HARDCODED Title Case list (it
 * includes "Apparel" even when no apparel product exists). Pinned here so
 * the clone keeps the exact dropdown the reference renders.
 */

describe("SHOP_CATEGORIES", () => {
  it("matches the reference's hardcoded dropdown order", () => {
    expect([...SHOP_CATEGORIES]).toEqual([
      "Equipment",
      "Supplements",
      "Accessories",
      "Apparel",
    ]);
  });
});

describe("categoryMatches", () => {
  it("passes every product for the all filter", () => {
    expect(categoryMatches("supplements", "all")).toBe(true);
    expect(categoryMatches("equipment", "all")).toBe(true);
  });

  it("matches case-insensitively (products are seeded lowercase)", () => {
    expect(categoryMatches("supplements", "Supplements")).toBe(true);
    expect(categoryMatches("equipment", "Equipment")).toBe(true);
    expect(categoryMatches("accessories", "Accessories")).toBe(true);
    expect(categoryMatches("apparel", "Apparel")).toBe(true);
  });

  it("rejects non-matching categories", () => {
    expect(categoryMatches("supplements", "Equipment")).toBe(false);
    expect(categoryMatches("test", "Equipment")).toBe(false);
  });
});
