import { expect, test } from "@playwright/test";

// Icon-library parity pins. The reference app was built with lucide-react
// v0.475.0 (its bundle embeds the version string); later lucide releases
// redesigned several icons this app renders (shopping-bag, dumbbell, menu,
// log-out, mail, search, users). These specs pin the exact geometry the
// reference renders so a dependency drift fails loudly.
// Also pins the sans font stack (Tailwind v4's early default — later v4
// releases changed the default --font-sans to the v3 stack) and the page
// title conventions.

test.describe("lucide icon geometry (reference build parity)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("nav Shop icon is the redesigned shopping-bag (lucide 0.475)", async ({ page }) => {
    const bag = page.locator("header nav svg.lucide-shopping-bag, header svg.lucide-shopping-bag").first();
    await expect(bag).toBeVisible();
    const d = await bag.locator("path").first().getAttribute("d");
    // 0.475's shopping-bag body path (0.525 ships a different, older design)
    expect(d).toBe("M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z");
  });

  test("header logo dumbbell renders the 0.475 five-path geometry", async ({ page }) => {
    const logo = page.locator("header svg.lucide-dumbbell").first();
    await expect(logo).toBeVisible();
    const paths = await logo.locator("path").all();
    expect(paths).toHaveLength(5);
    // The 0.475 design starts with the handle diagonal
    expect(await paths[0].getAttribute("d")).toBe("M14.4 14.4 9.6 9.6");
  });

  test("mobile hamburger renders 3 line elements (0.475 menu design)", async ({
    page,
  }) => {
    const lines = await page
      .locator("header button svg.lucide-menu line")
      .all();
    expect(lines).toHaveLength(3);
  });
});

test.describe("font stack + page titles (reference parity)", () => {
  test("the app uses the reference's ui-sans-serif stack", async ({ page }) => {
    await page.goto("/Home");
    const font = await page.evaluate(() => getComputedStyle(document.documentElement).fontFamily);
    expect(font).toContain("ui-sans-serif");
    expect(font).toContain("system-ui");
    expect(font).not.toContain("BlinkMacSystemFont");
  });

  test("the Cart page title is the reference's plain form", async ({ page }) => {
    await page.goto("/Cart");
    await expect(page).toHaveTitle("Cart | FitPro GYM App");
  });
});
