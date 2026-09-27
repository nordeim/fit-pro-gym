import { NextResponse } from "next/server";

/** Liveness probe (playwright webServer + deployment health checks). */
export async function GET() {
  return NextResponse.json({ status: "ok", app: "fit-pro-gym" });
}
