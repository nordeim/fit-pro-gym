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

    // S7-R12: every streak is absolutely positioned (the reference's DOM
    // renders `absolute top-[N%] h-N w-full …`). Without `absolute` the 8
    // lines stack in-flow and inflate the hero by 48px.
    for (let i = 0; i < 8; i++) {
      const pos = await lines.nth(i).evaluate((el) => getComputedStyle(el).position);
      expect(pos).toBe("absolute");
    }
  });

  test("hero section height matches the reference's 840px", async ({ page }) => {
    // Reference-measured: 840px at 1280×720 (the pre-S7-R12 clone measured
    // 888px — 48px of in-flow speed lines + the line-height inflation).
    const hero = page.locator(HERO).first();
    const h = await hero.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(Math.abs(h - 840)).toBeLessThanOrEqual(2);
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

  test("plans preview renders [newest, HARDCODED Pro, second-newest] (reference bundle algorithm)", async ({
    page,
  }) => {
    // Reference: Membership.list("-created_date", 3) over entities created
    // Basic Fit + Pro Athlete (2025-07-01) then Starter + Family Pack
    // (2025-07-30) yields e = [Family Pack, Starter, Pro Athlete]; its
    // bundle then renders [e[0], HARDCODED-Pro, e[1]] — the third fetched
    // entity is discarded and the middle card is NOT the entity's data.
    const section = page.locator('section:has(h2:has-text("Choose Your Perfect Plan"))');
    const cards = section.locator("h3");
    await expect(cards).toHaveCount(3, { timeout: 15_000 });
    await expect(cards.nth(0)).toHaveText("Family Pack");
    await expect(cards.nth(1)).toHaveText("Pro Athlete");
    await expect(cards.nth(2)).toHaveText("Starter");
    // The popular badge rides the hardcoded card's own flag.
    // (Scope to the card element itself — the plan-card root carries
    // bg-slate-800/70; a loose div.filter would match the wrapping grid.)
    const proCard = section
      .locator('div[class*="bg-slate-800/70"]')
      .filter({ has: page.getByRole("heading", { name: "Pro Athlete", exact: true }) });
    await expect(proCard).toHaveCount(1);
    await expect(proCard.getByText("Most Popular")).toBeVisible();
    // The hardcoded card lists the reference's FIVE design features —
    // including "Premium equipment access" — and NOT the entity's six
    // (no "Recovery room access", no "Mobile app with workout plans").
    await expect(proCard.locator("li")).toHaveCount(5);
    await expect(proCard.getByText("Premium equipment access")).toBeVisible();
    await expect(proCard.getByText("Recovery room access")).toHaveCount(0);
    await expect(proCard.getByText("Mobile app with workout plans")).toHaveCount(0);
  });

  test("shop preview renders the four NEWEST featured products, creation-desc", async ({
    page,
  }) => {
    // Reference: Product?featured=true&sort=-created_date&limit=4. Its
    // injected XSS junk row (featured, created 2026-05-15) now holds slot 1
    // and displaces Whey from the limit-4 window; the REAL products behind
    // it tie at 2025-07-01T14:15:08.553Z and their -created_date tie order
    // (re-audited live 2026-09-28, stable across 3 fetches) is
    // [Yoga Mat, Dumbbells, Pre-Workout, Whey] (newest first). The seed
    // staggers createdAt in that order; the junk row stays deliberately
    // not part of this clone's catalog, so the clone shows all four REAL
    // products with Whey filling the slot the junk row occupies on the
    // reference.
    const section = page.locator('section:has(h2:has-text("Professional Fitness Gear"))');
    const names = section.locator("h3");
    await expect(names).toHaveCount(4, { timeout: 15_000 });
    await expect(names.nth(0)).toHaveText("Yoga Mat Premium");
    await expect(names.nth(1)).toHaveText("Professional Dumbbells Set");
    await expect(names.nth(2)).toHaveText("Pre-Workout Energy");
    await expect(names.nth(3)).toHaveText("Whey Protein Powder");
  });

  test("shop preview grid uses the reference's gap-8 spacing", async ({ page }) => {
    // Reference: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8
    // (no pb-4 on the grid — the section owns its bottom spacing)
    const section = page.locator('section:has(h2:has-text("Professional Fitness Gear"))');
    const grid = section.locator("div.grid").first();
    await expect(grid).toHaveClass(/gap-8/);
    await expect(grid).not.toHaveClass(/gap-6/);
    await expect(grid).not.toHaveClass(/pb-4/);
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

test.describe("hero typography cascade (reference v3 emission parity)", () => {
  // The reference app is compiled with Tailwind v3: its responsive text-size
  // rules are emitted AFTER the base leading-* utilities, so on the rendered
  // reference `md:text-6xl`'s bundled line-height (1) beats the base
  // `leading-tight` (1.25) and `md:text-2xl`'s 2rem beats `leading-relaxed`
  // (1.625). Tailwind v4's --tw-leading mechanism reverses that precedence,
  // so the clone pins the reference's COMPUTED geometry explicitly.
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("hero h1 renders the reference's 60px line-height (lh 1 at desktop)", async ({ page }) => {
    const h1 = page.getByRole("heading", { name: "Unleash Your Ultimate Potential" });
    const lh = await h1.evaluate((el) => getComputedStyle(el).lineHeight);
    expect(lh).toBe("60px"); // reference-measured: 60px (clone pre-fix: 75px)
  });

  test("hero lede renders the reference's 32px line-height (2rem at desktop)", async ({ page }) => {
    const lede = page
      .getByText("Premium fitness experience with state-of-the-art equipment")
      .first();
    const lh = await lede.evaluate((el) => getComputedStyle(el).lineHeight);
    expect(lh).toBe("32px"); // reference-measured: 32px (clone pre-fix: 39px)
  });

  test("buttons render the reference's pointer cursor", async ({ page }) => {
    // The reference's bundle carries a base rule
    // `button,[role=button]{cursor:pointer}`; Tailwind v4's default shadcn
    // components ship cursor:default. Pin the reference's hand cursor.
    const cursors = await page.evaluate(() => {
      const btns = [
        ...document.querySelectorAll("header button, main button"),
      ].slice(0, 10);
      return btns.map((b) => getComputedStyle(b).cursor);
    });
    expect(cursors.length).toBeGreaterThanOrEqual(5);
    for (const c of cursors) {
      expect(c).toBe("pointer");
    }
  });

  test("the plans-preview CTA renders the reference's solid blue default-size button", async ({ page }) => {
    // Reference DOM: <button class="… text-primary-foreground shadow h-10
    // rounded-md bg-blue-600 hover:bg-blue-700 font-semibold px-6">
    // View All Plans <svg lucide-arrow-right w-4 h-4 ml-2> — a SOLID blue,
    // text-sm (base) button, NOT a gradient size=lg pill.
    const btn = page.getByRole("button", { name: "View All Plans" });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveClass(/bg-blue-600/);
    await expect(btn).toHaveClass(/hover:bg-blue-700/);
    await expect(btn).toHaveClass(/h-10/);
    await expect(btn).toHaveClass(/px-6/);
    await expect(btn).toHaveClass(/font-semibold/);
    await expect(btn).not.toHaveClass(/text-lg/);
    await expect(btn).not.toHaveClass(/bg-gradient-to-r/);

    const box = await btn.boundingBox();
    expect(box?.height).toBe(40); // reference-measured h-10
    const fs = await btn.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fs).toBe("14px"); // text-sm — the reference's CTA size

    const icon = btn.locator("svg");
    await expect(icon).toHaveClass(/h-4/);
    await expect(icon).toHaveClass(/w-4/);
  });
});
