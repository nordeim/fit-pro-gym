import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeCartItem } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

async function ownedItem(id: string, email: string) {
  const item = await prisma.cartItem.findUnique({ where: { id } });
  return item && item.userEmail === email ? item : null;
}

/** PATCH /api/cart/:id — update quantity (>= 1). */
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;

  let quantity: number | undefined;
  try {
    const body = (await req.json()) as { quantity?: number };
    quantity = body.quantity;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "quantity must be an integer >= 1" },
      { status: 400 }
    );
  }

  const item = await ownedItem(id, user.email);
  if (!item) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const updated = await prisma.cartItem.update({ where: { id }, data: { quantity } });
  return NextResponse.json(serializeCartItem(updated));
}

/** DELETE /api/cart/:id — remove a line. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const item = await ownedItem(id, user.email);
  if (!item) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
