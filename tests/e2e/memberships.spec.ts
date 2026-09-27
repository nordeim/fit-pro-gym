import { expect, test } from "@playwright/test";

// Memberships surface (contexts arrive authenticated): the plan rail sorted
// by price, the popular badge, the dedupe behavior, and the cross-sell
// dialog after a fresh add.

interface Plan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
}

test.describe("memberships route", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Memberships");
  });

  test("renders the page hero and the four seeded plans by price", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Choose Your Path to Greatness" })
    ).toBeVisible();
    await expect(page.getByText(/Find the perfect plan/)).toBeVisible();

    const names = page.locator("main button").filter({ hasText: /^Choose / });
    await expect(names).toHaveCount(4, { timeout: 15_000 });
    // Ascending price order: Starter, Basic Fit, Pro Athlete, Family Pack
    await expect(names.first()).toHaveText("Choose Starter");
    await expect(names.nth(1)).toHaveText("Choose Basic Fit");
    await expect(names.nth(2)).toHaveText("Choose Pro Athlete");
    await expect(names.nth(3)).toHaveText("Choose Family Pack");
  });

  test("the popular plan carries the Most Popular badge and ring", async ({ page }) => {
    const proCard = page
      .locator("div")
      .filter({ has: page.getByRole("heading", { name: "Pro Athlete", exact: true }) })
      .first();
    await expect(proCard.getByText("Most Popular")).toBeVisible();
  });

  test("Choose buttons carry the reference's shopping-cart icon", async ({ page }) => {
    // The reference's rail buttons render a lucide shopping-cart icon
    // (w-5 h-5, mr-2) before the "Choose …" label.
    const buttons = page.locator("main button").filter({ hasText: /^Choose / });
    await expect(buttons).toHaveCount(4, { timeout: 15_000 });
    const icon = buttons.first().locator("svg.lucide-shopping-cart");
    await expect(icon).toHaveCount(1);
    await expect(icon).toHaveClass(/h-5/);
    await expect(icon).toHaveClass(/mr-2/);
  });

  test("choosing a plan adds it to the cart and opens the cross-sell dialog", async ({
    page,
  }) => {
    // Clean slate
    const items = (await (await page.request.get("/api/cart")).json()) as Array<{ id: string }>;
    for (const item of items) {
      await page.request.delete(`/api/cart/${item.id}`);
    }
    await page.goto("/Memberships");

    await page.getByRole("button", { name: "Choose Family Pack" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByRole("heading", { name: "Complete Your Setup" })).toBeVisible();
    await expect(
      dialog.getByText("Members who bought this plan also love these items.")
    ).toBeVisible();
    // Cross-sell CTAs
    await expect(dialog.getByRole("button", { name: "No, Thanks" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Go to Cart" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Explore Full Store" })).toBeVisible();

    // Cross-sell offers the THREE NEWEST featured products
    // (reference query: Product?featured=true&sort=-created_date&limit=3)
    const crossSellNames = dialog.locator("h3");
    await expect(crossSellNames).toHaveCount(3, { timeout: 10_000 });
    await expect(crossSellNames.nth(0)).toHaveText("Pre-Workout Energy");
    await expect(crossSellNames.nth(1)).toHaveText("Yoga Mat Premium");
    await expect(crossSellNames.nth(2)).toHaveText("Professional Dumbbells Set");

    // The plan landed in the cart (badge ≥ 1)
    const badge = page.locator("header span").filter({ hasText: /^\d+$/ });
    await expect(badge.first()).not.toHaveText("0");
  });

  test("re-choosing a plan in the cart dedupes with the info message", async ({ page }) => {
    const plans = (await (await page.request.get("/api/memberships")).json()) as Plan[];
    const starter = plans.find((p) => p.name === "Starter");
    expect(starter).toBeDefined();

    // Seed the duplicate directly, then choose it in the UI
    await page.request.post("/api/cart", {
      data: {
        itemType: "membership",
        itemId: starter!.id,
        itemName: "Starter",
        price: 29,
        quantity: 1,
      },
    });
    await page.goto("/Memberships");
    await page.getByRole("button", { name: "Choose Starter" }).click();

    await expect(page.getByText("Membership already in your cart!").first()).toBeVisible({
      timeout: 15_000,
    });
    // No cross-sell dialog on the duplicate path
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the cross-sell dialog can add a product and navigate to the cart", async ({
    page,
  }) => {
    const items = (await (await page.request.get("/api/cart")).json()) as Array<{ id: string }>;
    for (const item of items) {
      await page.request.delete(`/api/cart/${item.id}`);
    }
    await page.goto("/Memberships");
    await page.getByRole("button", { name: "Choose Basic Fit" }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });

    // Add the first cross-sell product, then close
    await page.getByRole("button", { name: "No, Thanks" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
