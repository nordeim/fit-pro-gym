import { expect, test } from "@playwright/test";

// Home + Memberships + Shop reference-parity surfaces (session-2 remediation).
// These pin the DOM structure extracted from the live reference app:
// 8 speed lines per hero, the hero gradient/scrim/tint layer stack, the
// Why-Choose card anatomy (icons, text-4xl values), the promo pill, the
// hover-reveal shop cards, the sticky shop toolbar + Title Case category
// dropdown, and the Crown badge on the Memberships rail. Contexts arrive
// AUTHENTICATED (setup-project storageState).

const HERO = 'section:has(h1:has-text("Unleash Your"))';

test.describe("home hero (reference parity)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("hero section carries the gradient canvas + scrim + brand tint", async ({ page }) => {
    const hero = page.locator(HERO).first();
    await expect(hero).toHaveClass(/bg-gradient-to-br/);
    await expect(hero).toHaveClass(/from-gray-900/);
    await expect(hero).toHaveClass(/via-gray-800/);
    await expect(hero).toHaveClass(/to-gray-900/);

    const scrim = hero.locator('div[class*="bg-black"][class*="opacity-50"]');
    await expect(scrim).toHaveCount(1);
    const tint = hero.locator(
      'div[class*="bg-gradient-to-r"][class*="from-blue-600\\/20"][class*="to-green-600\\/20"]'
    );
    await expect(tint).toHaveCount(1);
  });

  test("hero renders 8 speed lines (6 glow + 2 solid)", async ({ page }) => {
    const hero = page.locator(HERO).first();
    // All full-width gradient streaks inside the hero
    const lines = hero.locator('div[class*="w-full"][class*="bg-gradient-to-r"][class*="via-"]');
    await expect(lines).toHaveCount(8);

    // Glow lines carry blur + colored shadows; solid pair doesn't
    const blurred = hero.locator('div[style*="blur"]');
    await expect(blurred).toHaveCount(6);
    const solid = hero.locator('div[class*="via-blue-300"], div[class*="via-green-300"]');
    await expect(solid).toHaveCount(2);
  });

  test("hero headline, CTAs, and tri-color stats render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Unleash Your Ultimate Potential" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Your Journey" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Watch Tour" })).toBeVisible();
    for (const stat of ["5000+", "24/7", "50+"]) {
      await expect(page.getByText(stat, { exact: true }).first()).toBeVisible();
    }
  });
});

test.describe("Why Choose (reference parity)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("section uses the slate gradient with tint + glow blobs", async ({ page }) => {
    const section = page.locator('section:has(h2:has-text("Why Choose FitnessPro?"))');
    await expect(section).toHaveClass(/bg-gradient-to-br/);
    await expect(section).toHaveClass(/from-slate-900/);
    await expect(section).toHaveClass(/to-slate-900/);
    await expect(section.locator('div[class*="blur-3xl"]')).toHaveCount(2);
  });

  test("four stat cards: reference icons, values, and labels", async ({ page }) => {
    const section = page.locator('section:has(h2:has-text("Why Choose FitnessPro?"))');
    const cards = section.locator("div.bg-white\\/5");
    await expect(cards).toHaveCount(4);

    // Icons: users / award / zap / star (NOT thumbs-up/trophy/clock)
    await expect(section.locator("svg.lucide-users")).toHaveCount(1);
    await expect(section.locator("svg.lucide-award")).toHaveCount(1);
    await expect(section.locator("svg.lucide-zap")).toHaveCount(1);
    await expect(section.locator("svg.lucide-star")).toHaveCount(1);
    await expect(section.locator("svg.lucide-thumbs-up")).toHaveCount(0);

    // Values are text-4xl white; labels in gray-300
    for (const value of ["5,000+", "10+", "24/7", "4.9"]) {
      await expect(section.locator("p", { hasText: value }).first()).toHaveClass(/text-4xl/);
    }
    for (const label of ["Happy Members", "Years Experience", "Gym Access", "Average Rating"]) {
      await expect(section.getByText(label, { exact: true })).toBeVisible();
    }
  });
});

test.describe("plans preview + shop preview (reference parity)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("plans section: slate canvas + gradient promo pill", async ({ page }) => {
    const section = page.locator('section:has(h2:has-text("Choose Your Perfect Plan"))');
    await expect(section).toHaveClass(/bg-slate-900/);

    const pill = section.getByText("Limited Time: Save 20% on Annual Plans");
    await expect(pill).toBeVisible();
    await expect(pill).toHaveClass(/bg-gradient-to-r/);
    await expect(pill).toHaveClass(/from-blue-600/);
    await expect(pill).toHaveClass(/to-green-500/);
  });

  test("shop preview: to-black canvas, premium badge, gradient heading", async ({ page }) => {
    const section = page.locator('section:has(h2:has-text("Professional Fitness Gear"))');
    await expect(section).toHaveClass(/bg-gradient-to-b/);
    await expect(section).toHaveClass(/from-slate-900/);
    await expect(section).toHaveClass(/to-black/);

    await expect(section.getByText("⚡ PREMIUM COLLECTION")).toBeVisible();
    const heading = section.getByRole("heading", { name: "Professional Fitness Gear" });
    await expect(heading).toHaveClass(/bg-clip-text/);
  });

  test("shop preview cards: full-bleed images with bottom scrim + Shop Now", async ({ page }) => {
    const section = page.locator('section:has(h2:has-text("Professional Fitness Gear"))');
    const card = section.locator("div.aspect-\\[3\\/4\\]").first();
    await expect(card).toBeVisible();

    // The image is absolutely positioned inside the card (full-bleed)
    await expect(card.locator("img.absolute")).toHaveCount(1);
    // ...with the black scrim overlay above it
    await expect(card.locator('div[class*="bg-gradient-to-t"][class*="from-black\\/80"]')).toHaveCount(1);
    // ...and a Shop Now link-button that reveals on hover
    await expect(card.getByRole("link", { name: "Shop Now" })).toBeAttached();
  });
});

test.describe("Memberships page (reference parity)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("page hero renders its own 8 speed lines", async ({ page }) => {
    await page.goto("/Memberships");
    const section = page.locator('section:has(h1:has-text("Choose Your Path to Greatness"))');
    const lines = section.locator('div[class*="w-full"][class*="bg-gradient-to-r"][class*="via-"]');
    await expect(lines).toHaveCount(8);
    await expect(section.locator("div[style*='blur']")).toHaveCount(6);
  });

  test("popular rail card carries the Crown badge", async ({ page }) => {
    await page.goto("/Memberships");
    const badge = page.getByText("Most Popular", { exact: true });
    await expect(badge).toBeVisible();
    await expect(badge.locator("svg.lucide-crown")).toHaveCount(1);
    // The reference positions the badge at top-6 + mt-10 (≈65px card offset)
    await expect(badge).toHaveClass(/mt-10/);
  });
});

test.describe("Shop page toolbar (reference parity)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("toolbar is a sticky card with the 4-column grid", async ({ page }) => {
    await page.goto("/Shop");
    const toolbar = page.locator("div.sticky.top-20").first();
    await expect(toolbar).toBeVisible();
    await expect(toolbar).toHaveClass(/bg-slate-800\/80/);
    await expect(toolbar).toHaveClass(/backdrop-blur/);
    await expect(toolbar).toHaveClass(/rounded-2xl/);

    const grid = toolbar.locator("div.grid").first();
    await expect(grid).toHaveClass(/lg:grid-cols-4/);
    // The search cell spans 2 of 4 desktop columns
    await expect(toolbar.locator("div.lg\\:col-span-2")).toHaveCount(1);

    // Inputs use the reference's h-9 slate-700 styling
    const search = page.getByPlaceholder("Search products by name...");
    await expect(search).toHaveClass(/h-9/);
    await expect(search).toHaveClass(/bg-slate-700/);
  });

  test("category dropdown lists the reference's Title Case categories", async ({ page }) => {
    await page.goto("/Shop");
    await page.getByRole("combobox").first().click();
    for (const option of ["All Categories", "Equipment", "Supplements", "Accessories", "Apparel"]) {
      await expect(page.getByRole("option", { name: option, exact: true })).toBeVisible();
    }
  });

  test("category filter still matches seeded (lowercase) products", async ({ page }) => {
    await page.goto("/Shop");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Supplements", exact: true }).click();
    const cards = page.locator("div.aspect-square");
    expect(await cards.count()).toBeGreaterThanOrEqual(2); // Pre-Workout + Whey
    await expect(page.getByRole("heading", { name: "Yoga Mat Premium" })).toHaveCount(0);
  });

  test("header Logout button renders at text-xs (reference parity)", async ({ page }) => {
    await page.goto("/Shop");
    const logout = page.getByRole("button", { name: "Logout", exact: true });
    await expect(logout).toBeVisible();
    await expect(logout).toHaveClass(/text-xs/);
  });
});
