import { expect, test } from "@playwright/test";

// Login surface: the /login route renders the reference auth card — with the
// real logo image, the bottom "Forgot password? / Need an account? Sign up"
// row (both plain grey buttons, no navigation on the reference), the red
// Alert error box ("Invalid email or password"), and NO redirect for
// authenticated visits (the reference renders the form regardless).
// This file OPTS OUT of the shared storageState (empty cookies) for the
// logged-out specs. (Deliberately does NOT probe the rate limiter — 10
// attempts/IP/15 min would poison the whole suite.)

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("login route", () => {
  test("renders the auth card with the real logo image in the ring chip", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Welcome to FitPro GYM App" })
    ).toBeVisible();
    await expect(page.getByText("Sign in to continue")).toBeVisible();

    // The logo is the reference's image inside the circular chip
    // (rounded-full + ring-4 ring-white/50, h-20 w-20 sm:h-24 sm:w-24).
    const img = page.getByRole("img", { name: "FitPro GYM App logo" });
    await expect(img).toBeVisible();
    await expect(img).toHaveClass(/object-cover/);
    const chip = page.locator("span.ring-4").first();
    await expect(chip).toHaveClass(/h-20/);
    const radius = await chip.evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
    expect(radius).toBeGreaterThan(1000);
  });

  test("h1 and subtitle use the reference's slate tracking classes", async ({ page }) => {
    await page.goto("/login");
    const h1 = page.getByRole("heading", { name: "Welcome to FitPro GYM App" });
    await expect(h1).toHaveClass(/text-slate-900/);
    await expect(h1).toHaveClass(/tracking-tight/);
    await expect(page.getByText("Sign in to continue")).toHaveClass(/text-slate-500/);
  });

  test("renders the Google button, OR divider, and icon inputs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await expect(page.getByText("or", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("the bottom row carries the grey Forgot password? and Sign up buttons", async ({ page }) => {
    await page.goto("/login");
    // Both are plain buttons (the reference's are inert, grey text-sm)
    const forgot = page.getByRole("button", { name: "Forgot password?" });
    await expect(forgot).toBeVisible();
    await expect(forgot).toHaveClass(/text-slate-500/);
    const signup = page.getByRole("button", { name: "Need an account? Sign up" });
    await expect(signup).toBeVisible();
    await expect(signup).toHaveClass(/text-slate-500/);
  });

  test("wrong password is rejected with the reference's red alert copy", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@fitpro.app");
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    const alert = page
      .getByRole("alert")
      // scoped: Next's route announcer also carries role=alert
      .filter({ hasText: "Invalid email or password" });
    await expect(alert).toBeVisible({ timeout: 15_000 });
    await expect(alert).toHaveText("Invalid email or password");
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

  test("authenticated visits still render the login form (no redirect)", async ({ page }) => {
    // The reference renders /login for signed-in users too — the page does
    // NOT bounce them to /Home.
    const res = await page.request.post("/api/auth/login", {
      data: { email: "demo@fitpro.app", password: "Demo1234!" },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Welcome to FitPro GYM App" })
    ).toBeVisible();
  });

  test("the login page title is the plain app title", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle("FitPro GYM App");
  });

  test("login labels render the reference's plain-label styling (20px line-height)", async ({ page }) => {
    // Reference DOM (login platform bundle):
    // <label class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70
    //   text-sm font-medium text-slate-700" for="email">Email</label>
    // — a PLAIN label (no leading-none → computed lh 20px from text-sm),
    // unlike the reference's checkout form which uses its shadcn Label
    // (WITH leading-none, lh 14px). The clone's auth form must render the
    // plain variant.
    await page.goto("/login");
    const email = page.getByLabel("Email", { exact: true });
    await expect(email).toBeVisible();

    const label = page.locator("label[for=email]");
    await expect(label).toHaveText("Email");
    await expect(label).toHaveClass(/text-sm/);
    await expect(label).toHaveClass(/font-medium/);
    await expect(label).toHaveClass(/text-slate-700/);
    await expect(label).not.toHaveClass(/leading-none/);
    const lh = await label.evaluate((el) => getComputedStyle(el).lineHeight);
    expect(lh).toBe("20px"); // reference-measured (clone pre-fix: 14px)

    const pwLabel = page.locator("label[for=password]");
    const pwLh = await pwLabel.evaluate((el) => getComputedStyle(el).lineHeight);
    expect(pwLh).toBe("20px");
  });

  test("login label→input spacing matches the reference (v3 space-y semantics)", async ({ page }) => {
    // S7-R13: Tailwind v4's space-y-* emits margin-bottom on the PRECEDING
    // sibling, but the reference's labels are display:inline — vertical
    // margins on inline elements are ignored, so the clone's label→input
    // gap collapsed to the line-box overhang (~4px). v3's space-y put
    // margin-top on the BLOCK input wrapper (6px). The clone pins that
    // gap explicitly with mt-1.5; the reference-measured field group is
    // 78px (label line-box 20 + gap 6 + input 48 + slack).
    await page.goto("/login");
    const groups = page.locator("main div[class*='space-y-1']");
    await expect(groups).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const gap = await groups.nth(i).evaluate((el) => {
        const label = el.querySelector("label")!;
        const wrap = el.querySelector("div.relative")!;
        const g = el.getBoundingClientRect();
        const labelLineBoxBottom = label.getBoundingClientRect().top + 20; // lh 20px
        return Math.round(wrap.getBoundingClientRect().top - labelLineBoxBottom);
      });
      expect(gap).toBe(6);
    }
  });
});
