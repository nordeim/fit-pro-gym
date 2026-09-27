import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cartTotal, toOrderLine } from "@/lib/utils";

interface CheckoutBody {
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

/**
 * POST /api/orders — place the order: snapshot the cart into an Order row
 * (items + shipping address + total), then clear the cart — the same
 * transaction the reference performs (Order.create + CartItem.delete * n).
 * Quantity-total is re-verified server-side against the DB prices.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const a = body.shippingAddress ?? {};
  if (!a.street?.trim() || !a.city?.trim() || !a.state?.trim() || !a.zip?.trim()) {
    return NextResponse.json(
      { error: "A complete shipping address (street, city, state, zip) is required." },
      { status: 400 }
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userEmail: user.email },
    orderBy: { createdAt: "asc" },
  });
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const orderItems = items.map(toOrderLine);
  const total = cartTotal(items);

  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userEmail: user.email,
        totalAmount: total,
        items: JSON.stringify(orderItems),
        shippingAddress: JSON.stringify({
          street: a.street.trim(),
          city: a.city.trim(),
          state: a.state.trim(),
          zip: a.zip.trim(),
        }),
        status: "pending",
      },
    }),
    prisma.cartItem.deleteMany({ where: { userEmail: user.email } }),
  ]);

  return NextResponse.json({ order: { id: order.id, total, status: order.status } }, { status: 201 });
}
