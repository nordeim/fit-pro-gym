import { describe, expect, it } from "vitest";

import {
  HERO_SPEED_LINES,
  MEMBERSHIPS_SPEED_LINES,
  type SpeedLine,
} from "./speed-lines";

/**
 * Pins the reference app's "speed line" streak specs (extracted from the live
 * DOM + JS bundle of https://fit-pro-gym-app-c6cbb3a3.base44.app/).
 *
 * Both heroes render 8 lines: 6 "glow" lines (colored shadow + blur, framer
 * x: 100vw → -100vw, linear, infinite) and 2 "solid" lines (via-blue-300 /
 * via-green-300, opacity-90, no blur, no shadow).
 */

function assertGlowLine(line: SpeedLine, top: string, via: string, opacity: string) {
  expect(line.top).toBe(top);
  expect(line.gradient).toContain(via);
  expect(line.opacity).toBe(opacity);
  expect(line.shadow).toBeTruthy();
  expect(line.blur).toBeTruthy();
}

function assertSolidLine(line: SpeedLine, top: string, via: string) {
  expect(line.top).toBe(top);
  expect(line.gradient).toContain(via);
  expect(line.opacity).toBe("opacity-90");
  expect(line.shadow).toBeUndefined();
  expect(line.blur).toBeUndefined();
  expect(line.height).toBe("h-2");
}

describe("HERO_SPEED_LINES (home hero)", () => {
  it("renders 8 lines (6 glow + 2 solid)", () => {
    expect(HERO_SPEED_LINES).toHaveLength(8);
  });

  it("glow lines match the reference's staggered tops/durations/delays", () => {
    const [a, b, c, d, e, f] = HERO_SPEED_LINES.slice(0, 6);
    assertGlowLine(a, "top-[20%]", "via-cyan-400", "opacity-60");
    expect(a.height).toBe("h-1");
    expect(a.duration).toBe(12);
    expect(a.delay).toBe(0);

    assertGlowLine(b, "top-[30%]", "via-blue-500", "opacity-70");
    expect(b.height).toBe("h-2");
    expect(b.duration).toBe(9);
    expect(b.delay).toBe(1);

    assertGlowLine(c, "top-[40%]", "via-yellow-400", "opacity-60");
    expect(c.duration).toBe(15);
    expect(c.delay).toBe(0.5);

    assertGlowLine(d, "top-[55%]", "via-green-400", "opacity-70");
    expect(d.duration).toBe(11);
    expect(d.delay).toBe(2);

    assertGlowLine(e, "top-[65%]", "via-blue-400", "opacity-80");
    expect(e.duration).toBe(8);
    expect(e.delay).toBe(1.5);

    assertGlowLine(f, "top-[80%]", "via-teal-400", "opacity-60");
    expect(f.duration).toBe(13);
    expect(f.delay).toBe(2.5);
  });

  it("solid lines sit at 30% / 55% (blue-300 / green-300)", () => {
    const [g, h] = HERO_SPEED_LINES.slice(6, 8);
    assertSolidLine(g, "top-[30%]", "via-blue-300");
    expect(g.duration).toBe(9);
    expect(g.delay).toBe(1);
    assertSolidLine(h, "top-[55%]", "via-green-300");
    expect(h.duration).toBe(11);
    expect(h.delay).toBe(2);
  });
});

describe("MEMBERSHIPS_SPEED_LINES (Memberships page hero)", () => {
  it("renders 8 lines (6 glow + 2 solid)", () => {
    expect(MEMBERSHIPS_SPEED_LINES).toHaveLength(8);
  });

  it("glow lines use the page's own tops and faster durations", () => {
    const [a, b, c, d, e, f] = MEMBERSHIPS_SPEED_LINES.slice(0, 6);
    assertGlowLine(a, "top-[15%]", "via-cyan-400", "opacity-60");
    expect(a.height).toBe("h-1");
    expect(a.duration).toBe(10);
    expect(a.delay).toBe(0);

    assertGlowLine(b, "top-[25%]", "via-blue-500", "opacity-70");
    expect(b.height).toBe("h-2");
    expect(b.duration).toBe(8);
    expect(b.delay).toBe(1);

    assertGlowLine(c, "top-[35%]", "via-yellow-400", "opacity-60");
    expect(c.duration).toBe(12);
    expect(c.delay).toBe(0.5);

    assertGlowLine(d, "top-[50%]", "via-green-400", "opacity-70");
    expect(d.duration).toBe(9);
    expect(d.delay).toBe(2);

    assertGlowLine(e, "top-[60%]", "via-blue-400", "opacity-80");
    expect(e.duration).toBe(7);
    expect(e.delay).toBe(1.5);

    assertGlowLine(f, "top-[75%]", "via-teal-400", "opacity-60");
    expect(f.duration).toBe(11);
    expect(f.delay).toBe(2.5);
  });

  it("solid lines sit at 25% / 50% (blue-300 / green-300)", () => {
    const [g, h] = MEMBERSHIPS_SPEED_LINES.slice(6, 8);
    assertSolidLine(g, "top-[25%]", "via-blue-300");
    expect(g.duration).toBe(8);
    expect(g.delay).toBe(1);
    assertSolidLine(h, "top-[50%]", "via-green-300");
    expect(h.duration).toBe(9);
    expect(h.delay).toBe(2);
  });
});

describe("SpeedLine invariants", () => {
  it("every line animates left with a positive duration", () => {
    for (const line of [...HERO_SPEED_LINES, ...MEMBERSHIPS_SPEED_LINES]) {
      expect(line.duration).toBeGreaterThan(0);
      expect(line.delay).toBeGreaterThanOrEqual(0);
      expect(line.gradient).toContain("from-transparent");
      expect(line.gradient).toContain("to-transparent");
    }
  });
});
