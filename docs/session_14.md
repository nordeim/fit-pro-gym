# Session 9 — Reference-Parity Re-Audit & Docs-Consistency Fix (Completion Log)

**Session:** 9 · **Date:** 2026-09-28 · **Base:** `d239a9b` (user's session-8 transcript commit)
**Delivered as:** one commit on `main` ("docs: session-9 parity re-audit — cross-doc consistency fix").
**Note on file naming:** `docs/session_12.md` is the session-8 completion log and
`docs/session_13.md` the session-8 run transcript; this completion log takes the
next free number. `docs/prompt-to-review-5.md` is the user's review prompt for
this cycle (saved verbatim, credentials + key stripped — the repo's convention
since `prompt-to-review-2.md`).

## Scope

Refresh the workspace, re-review the root docs + `docs/session_12.md` /
`worklog.md` / `docs/session_13.md`, validate the codebase, then a fresh
full-cycle parity audit against the live reference — mobile navigation as the
first-class citizen (Tailwind v4 watch) — followed by TDD remediation,
screenshots, docs, and push to `main`. Operator-specified items: `.env` with
`DATABASE_URL="file:../db/custom.db"` + `db/` at the repo root, the vitest +
playwright config validation, `.env.example` in the commit.

## Environment & baseline validation

- `git pull` fast-forwarded `e0349f2..d239a9b` (the user's session-13 transcript
  commit); working tree clean on `main`. lucide-react **0.475.0** pin verified
  in node_modules; `db/custom.db` + `db/e2e.db` present at the repo root;
  `.env` and `.env.example` both carry the required relative URL verbatim.
- Vitest + Playwright configs validated as present and correct
  (`vitest.config.ts` matches `*.test.ts` only; `playwright.config.ts` boots
  the standalone build on :3100 with the isolated `db/e2e.db`, storageState
  auth, single worker).
- Gates on arrival: lint ✓ · typecheck ✓ · unit 47/47 ✓ · build ✓ · e2e
  **74/74** ✓ — codebase/doc alignment confirmed before touching anything.
  Dev server (:3000) healthy on the canonical repo with the correct
  `DATABASE_URL`; `/api/products?featured=true&limit=4` serves the pinned
  session-8 order.

## Audit results

### Mobile navigation — full behavioral parity (fifth consecutive verification)

Verified end-to-end on BOTH sites at 390×844: hamburger → X icon swap
(`lucide-menu` ↔ `lucide-x`), menu structure (`md:hidden border-t
border-white/10 bg-gray-900/90 backdrop-blur-lg`), links Home/Memberships/Shop
with 48px touch targets, the active pill (`bg-white/10` — the clone's v4
emission renders the same 10% white as the target's v3 `rgba(255,255,255,.1)`),
the user section + Logout, route-change auto-close, and X-button close. **No
Tailwind v4 bugs** — the state-driven pattern (conditional render, symmetric
`hidden md:flex` / `md:hidden` breakpoints, never the `hidden` attribute,
render-time route-close) holds. The clone's `aria-expanded` / `aria-controls`
remain deliberate a11y enhancements (the reference has neither).

### Entity ground truth — NO drift this cycle

Products: the reference's `-created_date` order is UNCHANGED from the session-8
audit — [XSS-junk(2026-05-15), Yoga Mat, Dumbbells, Pre-Workout, Whey], stable
across 3 consecutive fetches (the junk row still `featured: true`, still
holding slot 1 of the home featured-4 window and displacing Whey; behind it the
real-product order [Yoga, Dumbbells, Pre, Whey]). Memberships: unchanged (two
tie groups 2025-07-01 / 2025-07-30). Rendered windows match the audit: home
featured-4 = [junk, Yoga, Dumbbells, Pre] on the target vs [Yoga, Dumbbells,
Pre, Whey] on the clone (identical real-product order modulo the standing
junk-row exclusion); cross-sell featured-3 likewise ([junk, Yoga, Dumbbells] vs
[Yoga, Dumbbells, Pre]). The dedupe path was also exercised live on the clone:
re-adding Starter bumped quantity (badge 5→6) with no dialog — the documented
app-level dedupe parity.

### Pinned-geometry re-measurement — all at parity

Desktop 1280×800: Home hero 840px (h1 60px/60px, lede 32px lines, 8 speed
lines all `absolute`), Memberships hero 424px, Shop h1 48px, login card 746px
with plain 20px inline labels, search + checkout placeholders #737373
(rgb(115,115,115)), every button `cursor: pointer`. Mobile 390×844: hero
1111px / h1 45px line-height / lede 33px — identical on both sites. The
target's CSS bundle is unchanged since session 8 (`index-BCeQAlMu.css`).
Full-page text diffs across Home/Memberships/Shop/Cart/login: clean except
the documented junk-row exclusion (the target renders the junk "Test / $0.01"
row; the clone shows Whey in its place), the avatar initial, and per-user
cart state. `/signup` still renders the branded 404 quoting "signup".

## Root finding (1 docs defect, no code defects)

| ID | Defect | Evidence |
|----|--------|----------|
| S9-C1 | PAD §15's "Home shop preview / cross-sell" ledger row still carried the STALE session-5 tie order [Pre-Workout, Yoga Mat, Dumbbells, Whey] — the session-8 update fixed the "Cross-sell dialog" and "Shop" rows but missed this third one, leaving the definitive engineering reference internally inconsistent (its own §15 disagreed with its v1.6 revision block, AGENTS.md, CLAUDE.md, SKILL.md §7, the seed, and both e2e order pins). | `Project_Architecture_Document.md` line 495 vs the seed's stagger order + `tests/e2e/home.spec.ts` / `memberships.spec.ts` pins |

No code remediation was required: the seed's 200ms stagger and both order-pinning
e2e specs already carry the current audited order and the full suite is green
(nothing to RED-GREEN — the tdd skill's seams stay as they are; the defect was
in prose, below every test seam).

## Remediation

1. **S9-C1:** PAD §15 row corrected to the current audited order
   [Yoga Mat, Dumbbells, Pre-Workout, Whey] with the junk-row displacement
   note (preview take 4 / cross-sell take 3). Cross-doc sweep afterwards:
   grepped every doc that carries the order — all current-state locations now
   agree (SKILL §7, CLAUDE.md, AGENTS.md, PAD §15 all three rows); only
   historical revision blocks retain the old order, as records.
2. **S9-C2:** all 12 screenshots re-captured under `docs/screenshots/`
   (desktop: Home/Memberships/Shop/Cart/login/signup-404/cross-sell; mobile:
   Home/Memberships/Shop/Cart/mobile-menu-open; canonical 3-line cart —
   Starter×3 + Yoga Mat + Pre-Workout, $200 — populated via the API with the
   seed's real image URLs). Pixel-level verification against the prior batch:
   cart-mobile matches the prior page height exactly (390×2067); the new
   captures actually IMPROVE on session-8's — they show the product-photo
   cart tiles loaded (session-8's had caught the fallback-initial tiles in
   an image-loading race) and the settled hero text behind the mobile menu.
   The cross-sell capture's Family Pack side-effect line was removed from the
   cart before the cart captures.
3. **S9-C3:** docs — prompt-to-review-5.md saved; PAD v1.6.1 (revision block
   + ledger row); SKILL v1.6.1 (project_state + lesson #9: when a fact lives
   in multiple doc locations, grep for every occurrence before calling the
   edit done); README status table (Session 9 row, 5-consecutive mobile-nav
   note, PAD v1.6.1 reference); AGENTS.md gotcha updated (stable ×3 fetches
   re-confirmed session 9 + the grep-every-doc warning); CLAUDE.md parity note
   (re-confirmed STABLE); this log; repo worklog.
4. **S9-C4:** final gates + commit + SSH-wrapper push (see the verification
   summary and the repo worklog).

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 47/47 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 74/74 (unchanged — no code or spec deltas this cycle) |
| Home preview vs reference | real-product order identical modulo the documented junk-row exclusion (no drift from session 8) |
| Cross-sell vs reference | [Yoga, Dumbbells, Pre-Workout] — reference algorithm over real products |
| Mobile menu vs reference | identical behavior (open/close/aria/route-change/active) — fifth consecutive verification, no Tailwind v4 bugs |
| Pinned geometries vs reference | hero 840px desktop / 1111px mobile, Memberships 424px, login 746px, placeholders #737373, buttons pointer — all exact |
| `.env` / `db/` / db-path | relative URL → `<repo>/db/custom.db` for CLI, build, and server — re-verified; `.env.example` matches verbatim and rides in the commit |
