import { NextRequest, NextResponse } from "next/server";

import {
  checkRateLimit,
  createSessionToken,
  hashPassword,
  recordFailure,
  sessionCookie,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  let name: string | undefined;
  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    name = body.name;
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const trimmedName = (name ?? "").trim();
  const trimmedEmail = (email ?? "").trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) {
    return NextResponse.json(
      { error: "Please provide your full name." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    recordFailure(ip);
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: trimmedEmail,
      name: trimmedName,
      passwordHash: hashPassword(password),
    },
  });

  const session = { id: user.id, email: user.email, name: user.name };
  const res = NextResponse.json({ user: session }, { status: 201 });
  res.cookies.set(sessionCookie.name, createSessionToken(session), sessionCookie);
  return res;
}
