# Session 12 — Reference-Parity Re-Audit (Clean Bill of Health, 8th Consecutive Mobile-Nav Verification)

**Session:** 12 · **Date:** 2026-09-29 · **Base:** `12910c1` (user's session-11 transcript commit)
**Delivered as:** one commit on `main` ("docs: session-12 parity re-audit — steady state confirmed, screenshots + docs refreshed").
**Note on file naming:** `docs/session_18.md` is the session-11 completion log and
`docs/session_19.md` the session-11 run transcript; this completion log takes the
next free number. `docs/prompt-to-review-8.md` is the user's review prompt for
this cycle (saved verbatim, credentials + key stripped — the repo's convention
since `prompt-to-review-2.md`).

## Scope

Refresh the workspace, re-review the root docs + `docs/session_18.md` /
`worklog.md` / `docs/session_19.md`, validate the codebase, then a fresh
full-cycle parity audit against the live reference — mobile navigation as the
first-class citizen (Tailwind v4 watch) — followed by TDD remediation,
screenshots, docs, and push to `main`. Operator-specified items: `.env` with
`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root, the vitest +
playwright config validation, `.env.example` in the commit.

## Environment & baseline validation

- Workspace refreshed via `git pull` (fast-forward `b96ef77..12910c1` — the
  user's session-11 transcript commit, the only delta being
  `docs/session_19.md`). Working tree clean on `main`. lucide-react **0.475.0**
  pin verified in node_modules; `db/custom.db` + `db/e2e.db` present at the
  repo root, the idempotent seed re-run (1 user, 4 plans, 4 products); `.env`
  and `.env.example` both carry the required relative URL verbatim and are
  byte-identical (the tracked `.env` is the sanitized template — no secrets
  ride in git).
- Vitest + Playwright configs validated as present and correct
  (`vitest.config.ts` matches `*.test.ts` only; `playwright.config.ts` boots
  the standalone build on :3100 with the isolated `db/e2e.db`, storageState
  auth, single worker).
- Gates on arrival: lint ✓ · typecheck ✓ · unit 47/47 ✓ · build ✓ · e2e
  **74/74** ✓ — codebase/doc alignment confirmed before touching anything.
  Dev server (:3000, daemonized, surviving from the session-11 cycle) healthy
  on the canonical repo with the correct `DATABASE_URL`;
  `/api/products?featured=true&limit=4` serves the pinned order [Yoga Mat,
  Dumbbells, Pre-Workout, Whey].

## Audit results

### Mobile navigation — full behavioral parity (eighth consecutive verification)

Verified end-to-end on BOTH sites at 390×844: hamburger → X icon swap
(`lucide-menu` ↔ `lucide-x`), menu structure (`md:hidden border-t
border-white/10 bg-gray-900/90 backdrop-blur-lg`), links Home/Memberships/Shop
with 48px touch targets, the user section + Logout, route-change auto-close
(target: /Home→/Shop via a menu-link tap; clone: /Home→/Memberships — menu
unmounted, icon restored to hamburger on both), and X-button close.
**No Tailwind v4 bugs** — the state-driven pattern (conditional render,
symmetric `hidden md:flex` / `md:hidden` breakpoints, never the `hidden`
attribute, render-time route-close) holds; the source contract re-verified in
`src/components/layout/header.tsx`. The clone's `aria-expanded` /
`aria-controls` remain deliberate a11y enhancements (the reference has neither).

This cycle additionally pinned the **active-pill exact-match semantics** on
both sites: at `/` (the un-redirected root) NEITHER site renders a pill on the
Home link, while at `/Home`, `/Shop`, and `/Memberships` both sites render the
`bg-white/10 text-white` pill on the matching link — the reference's
`pathname === href` semantics reproduced exactly by the clone's
`pathname === item.url` check (verified live on both sides at all four routes).

### Entity ground truth — NO drift this cycle

Products: the reference's `-created_date` order is UNCHANGED from the
session-8/9/10/11 audits — [XSS-junk(2026-05-15), Yoga Mat, Dumbbells, Pre-Workout,
Whey], stable across 3 consecutive fetches (the junk row still `featured:
true`, still holding slot 1 of the home featured-4 window and displacing
Whey). Memberships: unchanged (two tie groups 2025-07-01 / 2025-07-30).
Rendered windows match the audit: home featured-4 = [junk, Yoga, Dumbbells,
Pre] on the target vs [Yoga, Dumbbells, Pre, Whey] on the clone (identical
real-product order modulo the standing junk-row exclusion); cross-sell
featured-3 likewise, exercised live on the clone via Basic Fit (not in cart)
→ dialog renders [Yoga Mat, Dumbbells Set, Pre-Workout] — the reference
algorithm over real products.

### Pinned-geometry re-measurement — all at parity

Desktop 1280×800 (both sites): Home hero 840px (h1 60px/60px, lede 24px/32px
lines) with the identical 12-element absolute structure (2 `inset-0` overlays
+ 8 speed lines at the same `top-[…]` offsets + 2 glow blobs — class-for-class
identical on both sides), Memberships hero 424px, Shop h1 48px with the
untyped search input rendering placeholder #737373 (rgb(115,115,115)) and the
same placeholder text, login card **448×746px** (width × height — the 746px
pin is the card's height, re-clarified this cycle) with plain 20px-line-height
labels, every button `cursor: pointer`. Mobile 390×844: hero 1111px / h1 45px
line-height / lede 32.5px — identical on both sites. The target's CSS bundle
is unchanged since session 8 (`index-BCeQAlMu.css`). Full-page text diffs
across Home/Memberships/Shop/Cart/login: clean except the documented
junk-row exclusion (the target renders the junk "Test / $0.01" row; the clone
shows Whey in its place), the avatar initial / user name, and per-user cart
state (the target's cart remains empty — its documented base44-side cart-write
regression, not re-probed this cycle to avoid mutating the reference's data).
`/signup` still renders the identical branded 404 quoting "signup" on both
sites.

## Root finding (zero defects — code or docs)

| ID | Finding |
|----|---------|
| S12-C1 | **No code defects.** Every pinned surface re-measured at parity on both sites; the seed stagger + both e2e order pins carry the current audited order; the full gate suite (47 unit + 74 e2e) is green. Nothing to RED-GREEN — the tdd skill's seams stay as they are. |
| S12-C2 | **No cross-doc consistency defects** (the session-9 lesson-#9 sweep holds): every current-state mention of the tie order agrees across AGENTS.md, CLAUDE.md, SKILL §7/§12, PAD §15 (all three rows), the seed, and both e2e order pins; the only stale-looking `[Pre, Yoga, …]` strings live in historical revision blocks and the seed's session-5 history comment, where they belong. |

## Deliverables (the cycle's standing operational items)

1. **Screenshots:** all 12 re-captured under `docs/screenshots/` with the
   canonical 3-line cart (Starter×3 + Yoga Mat + Pre-Workout, $200, badge 5)
   verified via the API before, between, and after every capture that mutates
   cart state; the cross-sell capture's Basic Fit side-effect line was removed
   before the cart captures. Every capture's dimensions match the session-11
   batch EXACTLY (home-desktop 1280×3928, cart-mobile 390×2067, …); the
   full-page captures use the slow stepped-scroll settle so every
   framer-motion whileInView entrance and Unsplash image load completes
   before capture, and a git-authoritative pixel comparison against the
   committed session-11 batch confirms content parity (login-desktop,
   signup-404, and cart-mobile byte-identical; the rest 0% changed pixels —
   sub-pixel antialiasing noise only).
2. **Prompt archive:** `docs/prompt-to-review-8.md` saved verbatim
   (credentials + SSH key material stripped).
3. **Docs:** this log; PAD v1.6.4 (revision block + §15 ledger window
   extended to sessions 8–12); SKILL v1.6.4 (project_state + seed-table
   re-audit date); README status table (Session 12 row, 8-consecutive
   mobile-nav); CLAUDE.md re-audit note; repo worklog + workspace worklog.
4. **`.env.example`** re-verified verbatim against the codebase and riding in
   the commit.
5. **Final gates + commit + SSH-wrapper push** (see the verification summary).

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 47/47 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 74/74 (no code or spec deltas this cycle — the suite re-ran green as the final verification) |
| Home preview vs reference | real-product order identical modulo the documented junk-row exclusion (no drift from sessions 8–11) |
| Cross-sell vs reference | [Yoga, Dumbbells, Pre-Workout] — reference algorithm over real products |
| Mobile menu vs reference | identical behavior (open/close/aria/route-change/active-pill exact-match semantics) — eighth consecutive verification, no Tailwind v4 bugs |
| Pinned geometries vs reference | hero 840px desktop / 1111px mobile (h1 60/45px, lede 32/32.5px), Memberships 424px, Shop 48px + #737373, login card 448×746 + 20px-LH labels, buttons pointer — all exact on BOTH sites |
| `.env` / `db/` / db-path | relative URL → `<repo>/db/custom.db` for CLI, build, and server — re-verified; `.env.example` matches verbatim and rides in the commit |
