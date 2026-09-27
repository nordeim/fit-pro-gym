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

    // Seeded catalog (8 products)
    const cards = page.locator("main h3");
    await expect(cards).toHaveCount(8, { timeout: 15_000 });
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

    // A query that matches nothing renders the empty state
    await page.getByLabel("Search products by name").fill("zzz-no-match");
    await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
  });

  test("sorting by price re-orders the grid", async ({ page }) => {
    await page.getByLabel("Sort products").click();
    await page.getByRole("option", { name: "Price: Low to High" }).click();
    const first = page.locator("main h3").first();
    await expect(first).toHaveText("Resistance Bands Set");
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
