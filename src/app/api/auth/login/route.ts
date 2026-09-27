import { NextRequest, NextResponse } from "next/server";

import {
  authenticate,
  checkRateLimit,
  clearFailures,
  createSessionToken,
  recordFailure,
  sessionCookie,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 60) } }
    );
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await authenticate(email, password);
  if (!user) {
    recordFailure(ip);
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  clearFailures(ip);
  const res = NextResponse.json({ user });
  res.cookies.set(sessionCookie.name, createSessionToken(user), sessionCookie);
  return res;
}
