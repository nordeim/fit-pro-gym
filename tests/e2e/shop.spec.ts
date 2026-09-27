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
    // NOTE: measure BOTH boxes inside a single evaluate() call. The cards
    // animate in via framer-motion (y: 20 -> 0, 400ms + 50ms stagger) and
    // two sequential locator.boundingBox() calls can straddle the
    // animation — card box read mid-flight (transform offset applied),
    // row box read after settle — inflating the gap by up to 20px (a
    // flake observed after the session-6 build; the settled geometry is
    // 16px + subpixel rounding on every card).
    const gaps = await grid.evaluate((g) => {
      const bodies = [...g.querySelectorAll("div.flex-grow")];
      return bodies.map((b) => {
        const card = b.parentElement as HTMLElement;
        const row = b.querySelector("div.mt-4") as HTMLElement;
        return Math.round(
          card.getBoundingClientRect().bottom - row.getBoundingClientRect().bottom
        );
      });
    });
    expect(gaps.length).toBe(4);
    for (const gapPx of gaps) {
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

  test("shop hero typography matches the reference (md:text-5xl h1 + text-xl p + mb-12)", async ({ page }) => {
    // Reference DOM: <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">
    //                 <p class="text-xl text-gray-300 max-w-3xl mx-auto">
    //                 wrapper: <div class="text-center mb-12">
    const h1 = page.getByRole("heading", { name: "Premium Fitness Store" });
    await expect(h1).toHaveClass(/md:text-5xl/);
    await expect(h1).toHaveClass(/mb-6/);
    const fs = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fs).toBe("48px"); // reference-measured at 1280px (clone pre-fix: 36px)

    const lede = page.getByText("Discover professional-grade equipment").first();
    await expect(lede).toHaveClass(/text-xl/);
    await expect(lede).toHaveClass(/text-gray-300/);
    await expect(lede).toHaveClass(/max-w-3xl/);
    await expect(lede).toHaveClass(/mx-auto/);
    const ledeFs = await lede.evaluate((el) => getComputedStyle(el).fontSize);
    expect(ledeFs).toBe("20px"); // clone pre-fix: 18px (text-lg)

    await expect(lede.locator("xpath=..")).toHaveClass(/mb-12/);
  });

  test("search input renders the reference's untyped input + muted-foreground placeholder", async ({ page }) => {
    const input = page.getByLabel("Search products by name");
    // The reference's search input carries NO type attribute (plain text)
    const type = await input.evaluate((el) => (el as HTMLInputElement).getAttribute("type"));
    expect(type).toBeNull();

    // The reference renders #737373 (hsl 0 0% 45.1%): its Input base's
    // placeholder:text-muted-foreground wins the v3 cascade over the page's
    // placeholder-gray-400. rgb(115, 115, 115) == hsl(0 0% 45.1%)
    const ph = await input.evaluate((el) =>
      getComputedStyle(el as HTMLElement, "::placeholder").color
    );
    expect(ph).toMatch(/115,\s*115,\s*115/);
  });
});
