import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeCartItem } from "@/lib/serialize";

/** GET /api/cart — the signed-in user's cart lines. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const items = await prisma.cartItem.findMany({
    where: { userEmail: user.email },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items.map(serializeCartItem));
}

interface AddBody {
  itemType?: string;
  itemId?: string;
  itemName?: string;
  price?: number;
  quantity?: number;
  imageUrl?: string | null;
}

/**
 * POST /api/cart — add a line. Mirrors the reference's app-level dedupe:
 * an existing (user, itemType, itemId) line bumps quantity instead of
 * inserting a duplicate (message differs so the UI can toast it).
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: AddBody;
  try {
    body = (await req.json()) as AddBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const itemType = body.itemType;
  if (itemType !== "product" && itemType !== "membership") {
    return NextResponse.json(
      { error: "itemType must be 'product' or 'membership'" },
      { status: 400 }
    );
  }
  if (!body.itemId || !body.itemName || typeof body.price !== "number") {
    return NextResponse.json(
      { error: "itemId, itemName and price are required" },
      { status: 400 }
    );
  }
  const quantity = Math.max(1, Math.floor(body.quantity ?? 1));

  // Validate the referenced entity still exists (mirrors the reference's
  // implicit referential integrity via entity ids).
  if (itemType === "product") {
    const product = await prisma.product.findUnique({ where: { id: body.itemId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  } else {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: body.itemId } });
    if (!plan) {
      return NextResponse.json({ error: "Membership plan not found" }, { status: 404 });
    }
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userEmail_itemType_itemId: {
        userEmail: user.email,
        itemType,
        itemId: body.itemId,
      },
    },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return NextResponse.json({
      item: serializeCartItem(updated),
      duplicated: true,
      message:
        itemType === "membership"
          ? "Membership already in your cart!"
          : "Quantity updated in cart!",
    });
  }

  const item = await prisma.cartItem.create({
    data: {
      userEmail: user.email,
      itemType,
      itemId: body.itemId,
      itemName: body.itemName,
      price: body.price,
      quantity,
      imageUrl: body.imageUrl ?? null,
    },
  });

  return NextResponse.json(
    {
      item: serializeCartItem(item),
      duplicated: false,
      message:
        itemType === "membership"
          ? "Membership added to cart!"
          : "Product added to cart!",
    },
    { status: 201 }
  );
}
