import { expect, test } from "@playwright/test";

// Shop surface (contexts arrive authenticated): the store grid, the search
// box, the category filter, the sort select, and the add-to-cart round trip
// with the badge + toast feedback.

test.describe("shop route", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Shop");
  });

  test("renders the store header and the product grid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Premium Fitness Store" })).toBeVisible();
    await expect(page.getByText(/Discover professional-grade equipment/)).toBeVisible();

    // Seeded catalog — the reference's four real products (its injected
    // XSS junk row is deliberately not part of this clone's catalog)
    const cards = page.locator("main h3");
    await expect(cards).toHaveCount(4, { timeout: 15_000 });
    for (const name of ["Pre-Workout Energy", "Yoga Mat Premium", "Professional Dumbbells Set", "Whey Protein Powder"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }
  });

  test("search narrows the grid by name", async ({ page }) => {
    await page.getByLabel("Search products by name").fill("Yoga");
    await expect(page.getByRole("heading", { name: "Yoga Mat Premium" })).toBeVisible();
    const cards = page.locator("main h3");
    await expect(cards).toHaveCount(1);
  });

  test("category filter narrows the grid and the empty state renders", async ({ page }) => {
    // Open the category Select and pick "supplements"
    await page.getByLabel("Filter by category").click();
    await page.getByRole("option", { name: "supplements" }).click();
    const cards = page.locator("main h3");
    await expect(cards).toHaveCount(2);

    // A query that matches nothing renders the reference's empty state
    // (a single centered paragraph — no icon, no heading)
    await page.getByLabel("Search products by name").fill("zzz-no-match");
    await expect(
      page.getByText("No products found matching your criteria.")
    ).toBeVisible();
    await expect(page.getByText("Try adjusting your search or filter")).toHaveCount(0);
  });

  test("empty-category filter (Apparel) renders the reference empty state with the reference markup", async ({ page }) => {
    // The reference's four real products cover supplements/equipment/
    // accessories only — "Apparel" yields zero cards on BOTH sites and the
    // reference renders: <div class="text-center py-24"><p class=
    // "text-gray-400 text-lg">No products found matching your criteria.</p>
    await page.getByLabel("Filter by category").click();
    await page.getByRole("option", { name: "apparel" }).click();
    await expect(page.locator("main h3")).toHaveCount(0);

    const empty = page.locator("main p", { hasText: "No products found matching your criteria." });
    await expect(empty).toBeVisible();
    await expect(empty).toHaveClass(/text-gray-400/);
    await expect(empty).toHaveClass(/text-lg/);
    await expect(empty.locator("xpath=..")).toHaveClass(/py-24/);
    await expect(page.getByRole("heading", { name: "No products found" })).toHaveCount(0);
  });

  test("sorting by price re-orders the grid", async ({ page }) => {
    await page.getByLabel("Sort products").click();
    await page.getByRole("option", { name: "Price: Low to High" }).click();
    const first = page.locator("main h3").first();
    // Cheapest of the reference's real catalog: $34
    await expect(first).toHaveText("Pre-Workout Energy");
  });

  test("the product grid uses the reference's gap-8 spacing", async ({ page }) => {
    // Reference: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8
    const grid = page.locator("main div.grid", {
      has: page.locator("h3", { hasText: "Pre-Workout Energy" }),
    }).first();
    await expect(grid).toHaveClass(/gap-8/);
    await expect(grid).not.toHaveClass(/gap-6/);
  });

  test("product cards pin price rows to the card bottom (reference justify-between)", async ({ page }) => {
    // Reference card body: p-4 flex-grow flex flex-col justify-between —
    // every card's price row sits exactly one p-4 (16px) above the card
    // bottom, even when a sibling card's name wraps to two lines
    // ("Professional Dumbbells Set") and stretches the row.
    const grid = page.locator("main div.grid", {
      has: page.locator("h3", { hasText: "Pre-Workout Energy" }),
    }).first();
    await expect(grid.locator("div.flex-grow").first()).toHaveClass(/justify-between/);

    // Geometry: the price row bottom == card bottom - 16px (p-4) for every
    // card in the row (this is 49px on the un-remediated clone because the
    // 2-line Dumbbells name stretches the row height).
    const cardCount = await grid.locator("div.flex-grow").count();
    expect(cardCount).toBe(4);
    for (let i = 0; i < cardCount; i++) {
      const body = grid.locator("div.flex-grow").nth(i);
      // The card wrapper is the body div's direct parent (the motion.div
      // that owns the border/rounded classes and stretches to the row height)
      const card = body.locator("xpath=..");
      const priceRow = body.locator("div:has(> span.text-2xl)");
      const cardBox = await card.boundingBox();
      const priceBox = await priceRow.boundingBox();
      expect(cardBox).not.toBeNull();
      expect(priceBox).not.toBeNull();
      const cardBottom = cardBox!.y + cardBox!.height;
      const priceBottom = priceBox!.y + priceBox!.height;
      const gapPx = Math.round(cardBottom - priceBottom);
      expect(Math.abs(gapPx - 16)).toBeLessThanOrEqual(2);
    }
  });

  test("add-to-cart bumps the header badge and toasts", async ({ page }) => {
    // Start from a clean slate for the demo user (delete via the API)
    const items = (await (await page.request.get("/api/cart")).json()) as Array<{ id: string }>;
    for (const item of items) {
      await page.request.delete(`/api/cart/${item.id}`);
    }
    await page.goto("/Shop");

    await page
      .getByRole("button", { name: "Add Yoga Mat Premium to cart" })
      .click();
    await expect(page.getByText("Product added to cart!")).toBeVisible({
      timeout: 15_000,
    });

    // The badge total reflects the new quantity
    const badge = page.locator("header span").filter({ hasText: /^\d+$/ });
    await expect(badge.first()).toHaveText("1");
  });
});
