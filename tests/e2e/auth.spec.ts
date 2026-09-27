import { expect, test } from "@playwright/test";

// Login surface: the /login route renders the reference auth card, rejects
// bad credentials, signs the demo user in, and honors authenticated visits.
// This file OPTS OUT of the shared storageState (empty cookies) because it
// tests the logged-out surface. (Deliberately does NOT probe the rate
// limiter — 10 attempts/IP/15 min would poison the whole suite.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the auth card with the circular logo chip", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to FitPro GYM App" })
    ).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // The logo is a circular chip (rounded-full + ring-4 ring-white/50).
    // (Tailwind v4 computes rounded-full as calc(infinity * 1px) → Chrome
    // reports 33554432px, so the assertion checks the geometry, not exact
    // strings.)
    const chip = page.locator("span.rounded-full.ring-4").first();
    await expect(chip).toBeVisible();
    const radius = await chip.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(radius).toBeGreaterThan(1000);
    const shadow = await chip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toMatch(/0\.5\) 0px 0px 0px 4px/);
  });

  test("renders the Google button, OR divider, and icon inputs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByText("or", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("wrong password is rejected without a session", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@fitpro.app");
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Incorrect email or password").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test("valid credentials sign in and land on Home", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@fitpro.app");
    await page.getByLabel("Password").fill("Demo1234!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/Home/, { timeout: 15_000 });
    // Desktop chrome: the sticky header is the visible landmark once in.
    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Unleash Your", exact: false })
    ).toBeVisible();
  });

  test("authenticated visits redirect /login back to Home", async ({ page }) => {
    const res = await page.request.post("/api/auth/login", {
      data: { email: "demo@fitpro.app", password: "Demo1234!" },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/Home/);
  });
});
