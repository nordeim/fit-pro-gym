import { expect, test } from "@playwright/test";

// Cart surface (contexts arrive authenticated): item rows with quantity
// steppers, the order summary math, the checkout form validation, and the
// full order placement round trip (order created + cart cleared + toast).

async function clearCart(page: import("@playwright/test").Page) {
  const items = (await (await page.request.get("/api/cart")).json()) as Array<{ id: string }>;
  for (const item of items) {
    await page.request.delete(`/api/cart/${item.id}`);
  }
}

async function addLine(
  page: import("@playwright/test").Page,
  body: Record<string, unknown>
) {
  const res = await page.request.post("/api/cart", { data: body });
  expect(res.ok()).toBeTruthy();
}

test.describe("cart route", () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test("empty cart renders the empty state with both CTAs", async ({ page }) => {
    await page.goto("/Cart");
    await expect(page.getByRole("heading", { name: "Your Cart", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByText("Start shopping to add items to your cart")).toBeVisible();
    await expect(page.getByRole("button", { name: "Browse Memberships" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Shop Products" })).toBeVisible();
  });

  test("item rows show image fallback, type badge, price, and line total", async ({ page }) => {
    const products = (await (await page.request.get("/api/products")).json()) as Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    }>;
    const pw = products.find((p) => p.name === "Pre-Workout Energy")!;
    await addLine(page, {
      itemType: "product",
      itemId: pw.id,
      itemName: pw.name,
      price: pw.price,
      quantity: 2,
      imageUrl: pw.imageUrl,
    });
    const plans = (await (await page.request.get("/api/memberships")).json()) as Array<{
      id: string;
      name: string;
      price: number;
    }>;
    const pro = plans.find((p) => p.name === "Pro Athlete")!;
    await addLine(page, {
      itemType: "membership",
      itemId: pro.id,
      itemName: pro.name,
      price: pro.price,
      quantity: 1,
      imageUrl: null,
    });

    await page.goto("/Cart");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeHidden();
    await expect(page.getByText("Cart Items (2)")).toBeVisible();

    // Line rows: type badge (product/membership), unit price, line total
    await expect(page.getByText("Pre-Workout Energy")).toBeVisible();
    await expect(page.getByText("product", { exact: true })).toBeVisible();
    await expect(page.getByText("$68.00", { exact: true })).toBeVisible(); // 34 × 2
    await expect(page.getByText("Pro Athlete")).toBeVisible();
    await expect(page.getByText("membership", { exact: true })).toBeVisible();

    // Summary math: 68 + 59 = 127
    await expect(page.getByText("Order Summary")).toBeVisible();
    await expect(page.getByText("$127.00").first()).toBeVisible();
    await expect(page.getByText("Free", { exact: true })).toBeVisible();
  });

  test("quantity stepper updates the line and summary", async ({ page }) => {
    const products = (await (await page.request.get("/api/products")).json()) as Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    }>;
    const pw = products.find((p) => p.name === "Yoga Mat Premium")!;
    await addLine(page, {
      itemType: "product",
      itemId: pw.id,
      itemName: pw.name,
      price: pw.price,
      quantity: 1,
      imageUrl: pw.imageUrl,
    });

    await page.goto("/Cart");
    await page.getByRole("button", { name: "Increase Yoga Mat Premium quantity" }).click();
    await expect(page.getByText("Quantity updated in cart!")).toBeVisible({ timeout: 15_000 });
    // Line total, subtotal, and total all read $158.00 — first match is the line
    await expect(page.getByText("$158.00", { exact: true }).first()).toBeVisible(); // 79 × 2

    // The minus button is disabled at quantity 1 after decrementing back
    await page.getByRole("button", { name: "Decrease Yoga Mat Premium quantity" }).click();
    await expect(
      page.getByRole("button", { name: "Decrease Yoga Mat Premium quantity" })
    ).toBeDisabled();
  });

  test("checkout button stays disabled until the address is complete", async ({ page }) => {
    const plans = (await (await page.request.get("/api/memberships")).json()) as Array<{
      id: string;
      name: string;
      price: number;
    }>;
    await addLine(page, {
      itemType: "membership",
      itemId: plans[0]!.id,
      itemName: plans[0]!.name,
      price: plans[0]!.price,
      quantity: 1,
      imageUrl: null,
    });
    await page.goto("/Cart");

    const submit = page.getByRole("button", { name: /Complete Order - \$[\d.]+/ });
    await expect(submit).toBeDisabled();

    await page.getByLabel("Street Address").fill("123 Main Street");
    await expect(submit).toBeDisabled();
    await page.getByLabel("City").fill("New York");
    await page.getByLabel("State").fill("NY");
    await page.getByLabel("ZIP Code").fill("10001");
    await expect(submit).toBeEnabled();
  });

  test("placing an order clears the cart and toasts success", async ({ page }) => {
    const products = (await (await page.request.get("/api/products")).json()) as Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    }>;
    const pw = products.find((p) => p.name === "Whey Protein Powder")!;
    await addLine(page, {
      itemType: "product",
      itemId: pw.id,
      itemName: pw.name,
      price: pw.price,
      quantity: 1,
      imageUrl: pw.imageUrl,
    });

    await page.goto("/Cart");
    await page.getByLabel("Street Address").fill("123 Main Street");
    await page.getByLabel("City").fill("New York");
    await page.getByLabel("State").fill("NY");
    await page.getByLabel("ZIP Code").fill("10001");
    await page.getByRole("button", { name: /Complete Order - \$49\.00/ }).click();

    await expect(
      page.getByText("Order placed successfully! You will receive a confirmation email shortly.")
    ).toBeVisible({ timeout: 20_000 });

    // The cart emptied (badge gone → count endpoint 0) and we bounce Home
    const count = (await (await page.request.get("/api/cart/count")).json()) as {
      count: number;
    };
    expect(count.count).toBe(0);
    await expect(page).toHaveURL(/\/Home/, { timeout: 15_000 });
  });

  test("checkout inputs render the reference's muted-foreground placeholders", async ({ page }) => {
    // Reference ground truth: its checkout inputs carry BOTH the Input
    // base's placeholder:text-muted-foreground and the page's
    // placeholder:text-gray-400 — the v3 stylesheet emits the
    // muted-foreground rule LATER, so the rendered placeholder is
    // hsl(0 0% 45.1%) == rgb(115, 115, 115). The clone pins the same
    // rendered color via an explicit placeholder:text-muted-foreground.
    const products = (await (await page.request.get("/api/products")).json()) as Array<{
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    }>;
    const pw = products.find((p) => p.name === "Whey Protein Powder")!;
    await addLine(page, {
      itemType: "product",
      itemId: pw.id,
      itemName: pw.name,
      price: pw.price,
      quantity: 1,
      imageUrl: pw.imageUrl,
    });

    await page.goto("/Cart");
    for (const label of ["Street Address", "City", "State", "ZIP Code"]) {
      const input = page.getByLabel(label, { exact: false });
      await expect(input).toBeVisible();
      const ph = await input.evaluate((el) =>
        getComputedStyle(el as HTMLElement, "::placeholder").color
      );
      expect(ph).toMatch(/115,\s*115,\s*115/);
    }
  });
});
