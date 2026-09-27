import { PrismaClient } from "@prisma/client";
import { databaseUrl } from "./db-path";

// SQLite by default (zero-config local dev). The `db/` folder lives at the
// repo root, git-ignored. A RELATIVE `file:` URL is resolved against
// prisma/schema.prisma — exactly like the Prisma CLI — via src/lib/db-path.ts
// (tests/db-path.test.ts pins the contract), so the CLI (migrate/seed),
// `next build`, and the running server all agree regardless of the process
// working directory.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
