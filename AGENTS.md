# AGENTS.md — FitPro GYM App

Compact instructions for AI coding agents working in this repository. Every line answers: "would an agent likely miss this without help?"

## Commands

| Task | Command |
|------|---------|
| Install | `bun install` (npm also works) |
| Dev server | `bun run dev` → http://localhost:3000 |
| DB schema push | `bun run db:push` (creates `db/custom.db`) |
| DB seed (idempotent) | `bun run db:seed` |
| Production build | `bun run build` (standalone + copies static/, public/, prisma/schema.prisma into `.next/standalone/`) |
| Production start | `bun run start` (runs `.next/standalone/server.js`) |
| Unit tests | `bun run test` (Vitest, `*.test.ts` only) |
| Single unit test file | `bunx vitest run src/lib/utils.test.ts` |
| E2E tests | `bun run build && bun run test:e2e` (Playwright, production standalone on :3100, isolated `db/e2e.db`) |
| Single e2e spec | `bunx playwright test tests/e2e/home.spec.ts --reporter=line` |
| Typecheck | `bun run typecheck` |
| Lint | `bun run lint` |

**Verification order: `lint → typecheck → test → build → test:e2e`.** All five are green as of the last commit (36 unit + 43 e2e, incl. 15 home reference-parity specs).

## Critical gotchas

- **DATABASE_URL can be hijacked by the shell.** Some environments export an absolute `DATABASE_URL` that overrides `.env` (env vars beat `.env`). If Prisma prints the wrong database path, prefix the command: `DATABASE_URL="file:../db/custom.db" bun run db:seed`. Relative `file:` URLs resolve against `prisma/schema.prisma` — the contract is pinned by `tests/db-path.test.ts` (15 specs). Do not "simplify" `src/lib/db-path.ts` without re-running that suite.
- **E2E needs the standalone build.** `bun run test:e2e` boots `.next/standalone/server.js` (Playwright `webServer`), and the build script copies `prisma/schema.prisma` into it — that traced copy is what lets the standalone server's db-path detection find the repo root. Removing the `mkdir -p .next/standalone/prisma` from the build script breaks e2e with SQLite error 14.
- **Auth rate limiter is per-process and real.** 10 failed logins / 15 min / IP → 429 with `Retry-After`. E2e signs in ONCE via the `setup` project (storageState at `tests/e2e/.auth/user.json`, git-ignored). Don't add per-test logins.
- **SQLite has no scalar lists.** `MembershipPlan.features` is a JSON string; (de)serialization happens only in `src/lib/serialize.ts`. Never `JSON.parse(features)` anywhere else — use `serializeMembership`.
- **Tailwind v4, CSS-first.** No `tailwind.config.*` exists and none should be created — tokens live in `src/app/globals.css` (`@theme inline`). `tw-animate-css` is vendored at `src/app/tw-animate-vendored.css` (the package's exports only expose a `style` condition Turbopack can't resolve bare). See `docs/Tailwind-V4-Validation-Report.md`.
- **The speed-line and shop-category specs are PINNED by unit tests.** `src/lib/speed-lines.ts` (8 lines per hero — 6 glow + 2 solid, exact tops/colors/durations extracted from the reference's live DOM + JS bundle) and `src/lib/shop-categories.ts` (the reference's hardcoded Title Case dropdown) are contract data: change them only with the matching `.test.ts` in the same commit.
- **The mobile menu must NEVER use the `hidden` attribute.** In Tailwind v4 the `hidden` attribute overrides display utilities. The pattern is conditional render from state + `md:hidden` (see `src/components/layout/header.tsx`), with the route-change close implemented as React's render-time adjustment (`prevPathname` compare), not a `setMenuOpen` effect — the repo's ESLint (`react-hooks/set-state-in-effect`) enforces this.
- **React Router idioms are banned here.** Next.js `Link` takes `href`, not `to` (the reference app was React Router — this mistake 500s every page).
- **Capitalized routes are intentional parity.** `/Home`, `/Memberships`, `/Shop`, `/Cart` mirror the reference app's URLs; `/` renders the same page as `/Home`; `/login` and `/signup` are lowercase. Do not "normalize" them — the e2e specs and the header/footer links depend on them.

## Architecture map

- `src/app/(app)/` — chrome layout (Header + Footer) over the four app pages; `src/app/login/` + `src/app/signup/` render without chrome.
- `src/app/api/` — 11 JSON endpoints. Cart/order mutations are owner-checked server-side; the client re-fetches after every mutation (`AppProvider.refreshCart`) — the server is the single source of truth, client state is only chrome.
- `src/components/providers.tsx` — `AppProvider` (user, cart badge count, single-slot toast, 3s auto-dismiss), consumed via `useApp()`.
- `src/lib/` — `db.ts` (Prisma singleton with resolved URL), `auth.ts` (scrypt + HMAC cookie + rate limiter), `serialize.ts` (DB row → API DTO, the ONLY place features JSON is parsed), `speed-lines.ts` (hero streak specs, test-pinned), `shop-categories.ts` (reference's hardcoded filter list, test-pinned), `utils.ts` (`cartTotal` is float-safe via integer cents — unit-tested; don't replace with naive reduce).
- Demo credentials (seeded): `demo@fitpro.app` / `Demo1234!` (`tests/e2e/helpers.ts`).
- Reference recon artifacts (screenshots, extracted bundle snippets) live outside the repo and are not needed for development; `docs/screenshots/` holds the current captures.

## Testing conventions

- Unit layer (Vitest) covers **pure seams only**: db-path resolution, money math, serializers. Component tests are not used — UI coverage lives in Playwright.
- E2E specs use the storageState (already authenticated) except `tests/e2e/auth.spec.ts`, which opts out with an empty `storageState`.
- Cart setup inside specs goes through the API (`page.request`), never the UI — the UI path is what's being tested.
- Strict-mode: prefer `.first()` on price/text locators — line total, subtotal, and total can all read the same string.
