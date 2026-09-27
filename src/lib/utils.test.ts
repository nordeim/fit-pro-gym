import { describe, expect, it } from "vitest";
import { cartTotal, formatPrice, toOrderLine } from "@/lib/utils";
import { parseFeatures } from "@/lib/serialize";

// The pricing seams (pinned against the reference app's behaviors):
// - cartTotal must be float-safe (0.1-style money errors are the classic
//   e-commerce bug) and match the reference's reduce(price * quantity).
// - toOrderLine maps a CartItem to the Order items shape
//   ({ name, type, price, quantity }).

describe("cartTotal", () => {
  it("sums price * quantity", () => {
    expect(
      cartTotal([
        { price: 34, quantity: 2 },
        { price: 59, quantity: 1 },
      ])
    ).toBe(127);
  });

  it("is float-safe on money values that naive addition would corrupt", () => {
    // 0.1 + 0.2 === 0.30000000000000004 — the classic trap.
    expect(cartTotal([{ price: 0.1, quantity: 1 }, { price: 0.2, quantity: 1 }])).toBe(0.3);
    expect(cartTotal([{ price: 19.99, quantity: 3 }])).toBe(59.97);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("keeps cent-level precision over many lines", () => {
    const lines = Array.from({ length: 100 }, () => ({ price: 0.01, quantity: 1 }));
    expect(cartTotal(lines)).toBe(1);
  });
});

describe("formatPrice", () => {
  it("formats to two decimals with a dollar sign", () => {
    expect(formatPrice(34)).toBe("$34.00");
    expect(formatPrice(0.01)).toBe("$0.01");
    expect(formatPrice(149)).toBe("$149.00");
  });
});

describe("toOrderLine", () => {
  it("maps a CartItem row to the reference Order line shape", () => {
    expect(
      toOrderLine({
        itemName: "Pro Athlete",
        itemType: "membership",
        price: 59,
        quantity: 1,
      })
    ).toEqual({ name: "Pro Athlete", type: "membership", price: 59, quantity: 1 });
  });
});

describe("parseFeatures", () => {
  it("parses a JSON string array", () => {
    expect(parseFeatures('["24/7 gym access","Locker room"]')).toEqual([
      "24/7 gym access",
      "Locker room",
    ]);
  });

  it("returns [] for invalid JSON", () => {
    expect(parseFeatures("not json")).toEqual([]);
  });

  it("returns [] for non-array JSON", () => {
    expect(parseFeatures('{"a":1}')).toEqual([]);
  });

  it("filters out non-string entries", () => {
    expect(parseFeatures('["ok", 42, null, "still ok"]')).toEqual(["ok", "still ok"]);
  });
});
