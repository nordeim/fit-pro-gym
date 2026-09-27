import { expect, test } from "@playwright/test";

// 404 surface: the reference renders a branded not-found page — light
// slate-50 canvas, a giant pale "404", a divider, "Page Not Found", the
// message quoting the missing page name, and a "Go Home" button. The
// reference's /signup route ALSO renders this 404 (its signup page was
// never built). These specs pin that behavior for the clone.
// Contexts arrive authenticated — the 404 renders the same either way.

test.describe("not-found surface", () => {
  test("unknown routes render the reference's branded 404", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(
      page.getByText('The page "definitely-not-a-page" could not be found in this application.')
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Go Home" })).toBeVisible();
  });

  test("the 404 page has no app chrome (standalone light canvas)", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    // The slate-50 canvas is the page's own container (min-h-screen fills
    // the viewport, like the reference's standalone 404). Tailwind v4
    // authors slate-50 in oklch; Chrome reports it back as lab(), so pin
    // the class (the DOM-level parity contract) instead of a color string.
    const canvas = page.locator("div.min-h-screen");
    await expect(canvas).toHaveClass(/bg-slate-50/);
    await expect(canvas).toHaveClass(/flex/);
    await expect(canvas).toHaveClass(/items-center/);
  });

  test("Go Home returns to /Home", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await page.getByRole("button", { name: "Go Home" }).click();
    await expect(page).toHaveURL(/\/Home/);
  });

  test("/signup renders the 404 (the reference has no signup page)", async ({ page }) => {
    // The reference is a SPA: /signup serves the shell (HTTP 200) and its
    // router renders the 404 page with the route's own title. The clone
    // mirrors that: a 200 page rendering the 404 content.
    const res = await page.goto("/signup");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(
      page.getByText('The page "signup" could not be found in this application.')
    ).toBeVisible();
    // The reference keeps the route's own title.
    await expect(page).toHaveTitle("Signup | FitPro GYM App");
  });
});
