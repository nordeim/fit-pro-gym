import { expect, test } from "@playwright/test";

// Mobile navigation (390×844 — the reference's mobile chrome): the sticky
// blur header, the desktop nav hidden below md, the hamburger trigger, the
// state-driven collapsible menu (Tailwind v4 contract: NEVER the `hidden`
// attribute — see skills/nextjs16-tailwind4 §9/§10), the pathname-change
// auto-close, and the menu's user cluster. Contexts arrive AUTHENTICATED
// (setup-project storageState).

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/Home");
  });

  test("header renders: logo, cart, hamburger — desktop nav hidden", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS("position", "sticky");

    // Brand
    await expect(page.getByRole("heading", { name: "FitnessPro", exact: true })).toBeVisible();
    await expect(page.getByText("Premium Gym", { exact: true })).toBeVisible();

    // Cart link + hamburger trigger are the mobile actions. The trigger
    // renders inline-flex (the Button base) — visible and functional.
    await expect(page.getByRole("link", { name: /Cart, \d+ items?/ })).toBeVisible();
    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await expect(burger).toBeVisible();

    // The DESKTOP nav row is display:none below md (symmetric breakpoints)
    const desktopNav = page.locator('nav[aria-label="Primary"]');
    await expect(desktopNav).toBeHidden();

    // Desktop-only chrome (avatar cluster, Logout) must not leak onto mobile
    await expect(page.getByRole("button", { name: "Logout", exact: true })).toHaveCount(0);
  });

  test("hamburger opens the collapsible menu with aria state", async ({ page }) => {
    // Hold a stable locator BEFORE the tap — the accessible name flips
    // between "Open navigation menu" and "Close navigation menu".
    const burger = page.locator('header button[aria-controls="mobile-navigation"]');
    const menu = page.locator("#mobile-navigation");

    // Closed: no menu in the DOM (state-conditional render, not [hidden])
    await expect(menu).toHaveCount(0);

    await burger.tap();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("display", "block");
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "Close navigation menu" })).toBeVisible();

    // Menu contents: the three nav links + the user cluster
    for (const label of ["Home", "Memberships", "Shop"]) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(menu.getByText("Demo User")).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("menu links navigate AND the menu auto-closes on route change", async ({ page }) => {
    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await burger.tap();
    const menu = page.locator("#mobile-navigation");
    await expect(menu).toBeVisible();

    await menu.getByRole("link", { name: "Memberships", exact: true }).tap();
    await expect(page).toHaveURL(/\/Memberships\/?$/);
    await expect(
      page.getByRole("heading", { name: "Choose Your Path to Greatness" })
    ).toBeVisible();

    // The pathname-change effect closed the menu and reset the trigger
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open navigation menu" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  test("hamburger toggles closed with the X icon", async ({ page }) => {
    const burger = page.locator('header button[aria-controls="mobile-navigation"]');
    await burger.tap();
    const menu = page.locator("#mobile-navigation");
    await expect(menu).toBeVisible();

    await page.getByRole("button", { name: "Close navigation menu" }).tap();
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);
  });

  test("mobile menu links carry touch-sized targets (≥44px)", async ({ page }) => {
    const burger = page.getByRole("button", { name: "Open navigation menu" });
    await burger.tap();
    const link = page
      .locator("#mobile-navigation")
      .getByRole("link", { name: "Shop", exact: true });
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("logged-out mobile menu offers Login instead of the user cluster", async ({
    page,
  }) => {
    await page.request.post("/api/auth/logout");
    await page.goto("/Home");
    await page
      .locator('header button[aria-controls="mobile-navigation"]')
      .tap();
    const menu = page.locator("#mobile-navigation");
    await expect(menu.getByRole("button", { name: "Login" })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Logout" })).toHaveCount(0);
  });
});

test.describe("desktop (md+) navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("desktop nav row renders; hamburger and mobile menu absent", async ({ page }) => {
    await page.goto("/Home");
    const nav = page.locator('nav[aria-label="Primary"]');
    await expect(nav).toBeVisible();
    for (const label of ["Home", "Memberships", "Shop"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /navigation menu/ })).toHaveCount(0);
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);

    // Desktop-only: avatar initial + Logout
    await expect(page.getByRole("button", { name: "Logout", exact: true })).toBeVisible();
  });

  test("active link carries the bg-white/10 pill; inactive links don't", async ({ page }) => {
    await page.goto("/Shop");
    const active = page.locator('nav[aria-label="Primary"]').getByRole("link", {
      name: "Shop",
      exact: true,
    });
    const inactive = page.locator('nav[aria-label="Primary"]').getByRole("link", {
      name: "Home",
      exact: true,
    });
    const activeBg = await active.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(activeBg).not.toBe("rgba(0, 0, 0, 0)");
    const inactiveBg = await inactive.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(inactiveBg).toBe("rgba(0, 0, 0, 0)");
    await expect(active).toHaveAttribute("aria-current", "page");
  });
});
