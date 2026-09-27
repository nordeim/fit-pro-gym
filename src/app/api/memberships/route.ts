import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { serializeMembership } from "@/lib/serialize";

/** GET /api/memberships — the plan catalog (features parsed to string[]). */
export async function GET() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(plans.map(serializeMembership));
}
