import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/cart/count — header badge total (sum of quantities). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ count: 0 });
  }
  const items = await prisma.cartItem.findMany({
    where: { userEmail: user.email },
    select: { quantity: true },
  });
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ count });
}
