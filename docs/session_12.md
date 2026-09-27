# Session 8 — Reference-Parity Audit & Remediation (Completion Log)

**Session:** 8 · **Date:** 2026-09-28 · **Base:** `a2f16f1` (user's session-7 docs commit)
**Delivered as:** one commit on `main` ("fix: reference parity remediation (session 8)").
**Note on file naming:** `docs/session_10.md` is the session-7 completion log and
`docs/session_11.md` the session-7 run transcript; this completion log takes the
next free number. `docs/prompt-to-review-4.md` is the user's review prompt for
this cycle (saved verbatim, credentials + key stripped — the repo's convention
since `prompt-to-review-2.md`).

## Scope

Refresh the workspace, re-review the root docs + `docs/session_10.md` /
`worklog.md` / `docs/session_11.md`, validate the codebase, then a fresh
full-cycle parity audit against the live reference — mobile navigation as the
first-class citizen (Tailwind v4 watch) — followed by TDD remediation,
screenshots, docs, and push to `main`. Operator-specified items: `.env` with
`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root, the vitest +
playwright config validation, `.env.example` in the commit.

## Environment & baseline validation

- Fresh clone at `a2f16f1`; `bun install` (lucide-react **0.475.0** pin verified
  in node_modules); the documented shell `DATABASE_URL` hijack confirmed (the
  sandbox exports an absolute path outside the repo — every db command runs
  with the `DATABASE_URL="file:../db/custom.db"` prefix).
- `db/` folder created at the repo root via `db:push` + `db:seed` (1 user,
  4 plans, 4 products). `.env` already carried the required relative URL;
  `src/lib/db-path.ts` resolves it to `<repo>/db/custom.db` for the CLI,
  `next build`, and the running server alike (contract pinned by the 15
  `tests/db-path.test.ts` specs — no code change needed; verified live via
  `/api/products` on the dev server and the full e2e suite on `db/e2e.db`).
- Vitest + Playwright configs validated as present and correct:
  `vitest.config.ts` matches `*.test.ts` only; `playwright.config.ts` boots
  the standalone build on :3100 with the isolated `db/e2e.db`, storageState
  auth, single worker. (Cosmetic fix applied: the vitest header comment still
  listed the scaffold's leftover seam names — corrected to the repo's actual
  seams.)
- Gates on arrival: lint ✓ · typecheck ✓ · unit 47/47 ✓ · build ✓ · e2e
  74/74 ✓ — codebase/doc alignment confirmed before touching anything.

## Audit results

### Mobile navigation — full behavioral parity (fourth consecutive verification)

Verified end-to-end on BOTH sites at 390×844: hamburger → X icon swap
(`lucide-menu w-5 h-5` ↔ `lucide-x`), menu structure
(`md:hidden border-t border-white/10 bg-gray-900/90 backdrop-blur-lg` +
`px-4 py-3 space-y-2`), links Home/Memberships/Shop with 48px touch targets,
the active pill (`bg-white/10 text-white`) following the route, the user
section + Logout, route-change auto-close, and X-button close. **No Tailwind
v4 bugs** — the state-driven pattern (conditional render, symmetric
`hidden md:flex` / `md:hidden` breakpoints, never the `hidden` attribute,
render-time route-close) holds. The clone's `aria-expanded` / `aria-controls`
remain deliberate a11y enhancements (the reference has neither).

### Pinned-geometry re-measurement — all at parity

Desktop 1280×800: Home hero 840px (h1 60px/60px, lede 24px/32px, 8 speed
lines `absolute`), Memberships hero 424px, Shop h1 48px, login card 746px
with plain 20px inline labels, search + checkout placeholders #737373, every
button `cursor: pointer`, Shop grid `gap-8`, memberships rail native
scrollbar. Mobile 390×844: hero 1111px / h1 45px line-height / lede 33px —
identical to the reference on every metric. Full-page text diffs over
Home/Memberships/Shop/Cart/login: identical except the documented
junk-row exclusion and the logged-in user's avatar initial.

### Entity ground truth — one drift

Memberships: unchanged (two tie groups 2025-07-01 / 2025-07-30). Products:
the four real products are unchanged, but the reference's injected
"XSS-INJECT-TEST" junk row is now `featured: true` with `created_date`
2026-05-15 — newer than every real product — so it holds slot 1 of the
home's `featured&-created_date&limit=4` window and displaces Whey from the
window entirely. Behind it, the four real products still tie at
2025-07-01T14:15:08.553Z, and the backend's tie order flipped since session 5:
now **[Yoga Mat, Dumbbells, Pre-Workout, Whey]** (stable across 3 consecutive
fetches; was [Pre-Workout, Yoga, Dumbbells, Whey]). The target's CSS bundle
was also redeployed since session 7 (now `index-BCeQAlMu.css`) but its
v3-emission semantics are unchanged. Cart writes remain broken target-side
(documented base44 regression). Shop page order is unaffected on both sites
(client-side alphabetical default sort).

## Root finding (1 defect, TDD-remediated) — theme: **the reference's `-created_date` tie order is server-driftable state, not a contract**

| ID | Defect | Evidence |
|----|--------|----------|
| S8-R1 | The clone's home "Professional Fitness Gear" preview + cross-sell dialog pinned the STALE session-5 featured order [Pre-Workout, Yoga, Dumbbells, Whey] while the reference's current real-product order is [Yoga, Dumbbells, Pre, Whey] (with the featured junk row displacing Whey from the limit-4 window). | 3 consecutive entity-API fetches + the rendered DOM order on the target |

## Remediation (TDD — specs first)

1. **RED:** the two order-pinning e2e specs updated first —
   `tests/e2e/home.spec.ts` ("shop preview renders the four NEWEST featured
   products, creation-desc") → [Yoga, Dumbbells, Pre, Whey], and
   `tests/e2e/memberships.spec.ts` (cross-sell) → [Yoga, Dumbbells,
   Pre-Workout]. Both failed pre-fix for exactly the audited reason.
2. **GREEN:** `prisma/seed.ts` products array reordered so the 200ms
   `createdAt` stagger pins the newly audited tie order (anchor unchanged at
   2025-07-01T14:15:08.553Z); the junk row stays deliberately excluded per
   the repo's standing data-hygiene decision — the clone shows all four REAL
   products, with Whey filling the slot the junk row occupies on the
   reference. Dev DB re-seeded. The Shop page is unaffected (alphabetical
   client-side sort on both sites).
3. **Gates:** lint ✓ · typecheck ✓ · unit 47/47 ✓ · build ✓ · e2e **74/74**.
4. **Live re-verification:** clone home preview = [Yoga, Dumbbells,
   Pre-Workout, Whey] vs target [XSS-junk, Yoga, Dumbbells, Pre-Workout] —
   identical real-product order modulo the documented junk exclusion; plan
   preview [Family Pack, Pro Athlete, Starter] identical; cross-sell [Yoga,
   Dumbbells, Pre-Workout] = the reference algorithm over the real products.
5. **Screenshots:** all 12 captures re-taken under `docs/screenshots/`
   (desktop: Home/Memberships/Shop/Cart/login/signup-404/cross-sell; mobile:
   Home/Memberships/Shop/Cart/mobile-menu-open; populated 3-line cart via the
   API; stepped-scroll settling for the animated full-page shots). VLM
   spot-checks: cart + mobile menu verified glitch-free (the only flagged
   artifact is the dev-mode Next.js tools badge — documented benign).
6. **Docs:** prompt-to-review-4.md saved; README (status table), AGENTS.md
   (new tie-order gotcha), CLAUDE.md (parity note), PAD v1.6 (revision block
   + 2 ledger rows), SKILL v1.6.0 (domain table + lesson #8), this log,
   worklog. `.env.example` verified to match the codebase verbatim (it
   already documents the relative-URL contract and the shell-hijack prefix)
   and rides in the commit.

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 47/47 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 74/74 (2 order pins re-pinned RED-first) |
| Home preview vs reference | real-product order identical modulo the documented junk-row exclusion |
| Cross-sell vs reference | [Yoga, Dumbbells, Pre-Workout] — reference algorithm over real products |
| Mobile menu vs reference | identical behavior (open/close/aria/route-change/active) — fourth consecutive verification, no Tailwind v4 bugs |
| Pinned geometries vs reference | hero 840px desktop / 1111px mobile, Memberships 424px, login 746px, placeholders #737373, buttons pointer — all exact |
| `.env` / `db/` / db-path | relative URL → `<repo>/db/custom.db` for CLI, build, and server — verified live |
