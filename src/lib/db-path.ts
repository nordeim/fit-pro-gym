import fs from "node:fs";
import path from "node:path";

/**
 * db-path contract (pinned by tests/db-path.test.ts):
 *
 * 1. resolveDatabaseUrl(envValue, anchors):
 *    - A RELATIVE `file:` URL resolves against the FIRST "anchor" directory
 *      that contains prisma/schema.prisma — exactly like the Prisma CLI
 *      resolves against the schema file — so `file:../db/custom.db` points
 *      at <anchor>/db/custom.db regardless of the process working directory.
 *    - Absolute file: URLs (POSIX + Windows drive letters) pass through.
 *    - Non-SQLite URLs (postgres://...) pass through untouched.
 *    - A missing/blank env value falls back to the documented default
 *      <anchor>/db/custom.db.
 *
 * 2. standaloneRepoRoot(dir):
 *    - The Next.js standalone server runs with CWD = <repo>/.next/standalone
 *      (and the build tracer copies prisma/schema.prisma into it), so a naive
 *      CWD rule would resolve the database into the BUILD OUTPUT. The
 *      detector recognizes that folder (server.js + traced schema) and
 *      returns the real repo two levels up — or null when the dir is a
 *      deployed copy (no repo above) or a plain directory.
 */

const DEFAULT_RELATIVE = "file:../db/custom.db";

/**
 * Recognizes a Next.js standalone build dir and returns the repo root two
 * levels above it, or null for anything else (deployed copies, plain dirs).
 */
export function standaloneRepoRoot(dir: string = process.cwd()): string | null {
  const isStandalone =
    fs.existsSync(path.join(dir, "server.js")) &&
    fs.existsSync(path.join(dir, "prisma", "schema.prisma"));
  if (!isStandalone) return null;

  const repo = path.resolve(dir, "..", "..");
  if (fs.existsSync(path.join(repo, "prisma", "schema.prisma"))) return repo;
  return null;
}

function isAbsoluteFileUrl(url: string): boolean {
  if (url.startsWith("file:")) {
    const rest = url.slice("file:".length);
    // POSIX absolute: /...
    if (rest.startsWith("/")) return true;
    // Windows drive letter: C:\... or C:/...
    if (/^[a-zA-Z]:[\\/]/.test(rest)) return true;
  }
  return false;
}

/**
 * Resolves the DATABASE_URL value against the first anchor that contains
 * prisma/schema.prisma. Pure function — exported for unit tests.
 */
export function resolveDatabaseUrl(
  envValue: string | undefined,
  anchors: string[]
): string {
  const value = (envValue ?? "").trim();
  const url = value === "" ? DEFAULT_RELATIVE : value;

  // Non-file: URLs (postgres, mysql, ...) pass through untouched.
  if (!url.startsWith("file:")) return url;

  // Absolute file: URLs pass through untouched.
  if (isAbsoluteFileUrl(url)) return url;

  // Relative file: URL — resolve against the first anchor with a schema.
  const relative = url.slice("file:".length);
  const anchor =
    anchors.find((a) => fs.existsSync(path.join(a, "prisma", "schema.prisma"))) ??
    anchors[anchors.length - 1];
  return "file:" + path.resolve(anchor, "prisma", relative);
}

/** Production entry: resolve the runtime DATABASE_URL for PrismaClient. */
export function databaseUrl(): string {
  const cwd = process.cwd();
  const detectedRepo = standaloneRepoRoot(cwd);
  // Candidate order (see the contract): the module-derived anchor first (a
  // traced build has no schema there — skipped), then the detected repo
  // root, then the CWD itself (the standalone dir) last.
  const moduleRoot = path.resolve(__dirname, "..", "..");
  const anchors = detectedRepo
    ? [moduleRoot, detectedRepo, cwd]
    : [cwd, moduleRoot];
  return resolveDatabaseUrl(process.env.DATABASE_URL, anchors);
}
