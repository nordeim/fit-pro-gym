import { describe, expect, it } from "vitest";

import {
  HOME_FEATURED_PLAN,
  homePlanSlots,
} from "@/lib/home-featured-plan";

import type { MembershipDTO } from "@/components/providers";

function plan(name: string, price: number): MembershipDTO {
  return {
    id: `entity-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    description: "entity row",
    price,
    durationMonths: 1,
    features: ["entity feature"],
    popular: false,
    colorScheme: "purple",
  };
}

describe("HOME_FEATURED_PLAN (the reference's hardcoded home card)", () => {
  it("carries the reference bundle's exact identity and price", () => {
    expect(HOME_FEATURED_PLAN.name).toBe("Pro Athlete");
    expect(HOME_FEATURED_PLAN.price).toBe(59);
    expect(HOME_FEATURED_PLAN.description).toBe(
      "Comprehensive training for serious fitness enthusiasts",
    );
    expect(HOME_FEATURED_PLAN.popular).toBe(true);
    expect(HOME_FEATURED_PLAN.colorScheme).toBe("blue");
  });

  it("lists the reference's exact five features, in order", () => {
    expect(HOME_FEATURED_PLAN.features).toEqual([
      "24/7 gym access",
      "Personal trainer sessions (4/month)",
      "Group fitness classes",
      "Premium equipment access",
      "Nutrition consultation",
    ]);
  });

  it("does NOT use the entity's feature list (reference self-drift)", () => {
    // The Pro Athlete ENTITY on the reference carries these; the hardcoded
    // home card does not. Pin the difference so the two lists can never
    // silently converge.
    expect(HOME_FEATURED_PLAN.features).not.toContain("Recovery room access");
    expect(HOME_FEATURED_PLAN.features).not.toContain(
      "Mobile app with workout plans",
    );
  });
});

describe("homePlanSlots (the reference's [e[0], n, e[1]] algorithm)", () => {
  it("places the hardcoded plan in the middle of the newest two entities", () => {
    const entities = [plan("Family Pack", 149), plan("Starter", 29), plan("Pro Athlete", 59)];
    expect(homePlanSlots(entities).map((m) => m.name)).toEqual([
      "Family Pack",
      "Pro Athlete",
      "Starter",
    ]);
  });

  it("replaces the middle slot with the hardcoded card even when the entity there differs", () => {
    // The reference's third-newest entity is discarded — the bundle replaces
    // whatever sits in the middle, so slot 1 is ALWAYS the hardcoded card.
    const entities = [plan("Family Pack", 149), plan("Basic Fit", 39), plan("Pro Athlete", 59)];
    const slots = homePlanSlots(entities);
    expect(slots[1]).toBe(HOME_FEATURED_PLAN);
    expect(slots.map((m) => m.name)).toEqual([
      "Family Pack",
      "Pro Athlete",
      "Basic Fit",
    ]);
  });

  it("drops the third fetched entity (never rendered, like the reference)", () => {
    const entities = [
      plan("Family Pack", 149),
      plan("Starter", 29),
      plan("Pro Athlete", 59),
      plan("Basic Fit", 39),
    ];
    expect(homePlanSlots(entities)).toHaveLength(3);
    expect(homePlanSlots(entities)[2].name).toBe("Starter");
  });

  it("leads with the hardcoded card when fewer than two entities exist", () => {
    expect(homePlanSlots([plan("Family Pack", 149)]).map((m) => m.name)).toEqual([
      "Pro Athlete",
      "Family Pack",
    ]);
    expect(homePlanSlots([])).toEqual([HOME_FEATURED_PLAN]);
  });
});
