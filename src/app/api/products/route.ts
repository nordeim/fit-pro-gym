import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";

/** GET /api/products?featured=true&limit=3 — the shop catalog. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";
  const limitParam = Number(searchParams.get("limit") ?? "0");

  const products = await prisma.product.findMany({
    where: featured ? { featured: true } : undefined,
    orderBy: { createdAt: "desc" },
    ...(Number.isFinite(limitParam) && limitParam > 0 ? { take: limitParam } : {}),
  });

  return NextResponse.json(products.map(serializeProduct));
}
