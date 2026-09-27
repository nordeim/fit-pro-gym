# Session 5 — Reference-Parity Audit & Remediation (Completion Log)

**Session:** 5 · **Date:** 2026-09-27 · **Base:** `2202c52` (user's session-log update)
**Delivered as:** one commit on `main` (see the git log — "fix: reference parity
remediation (session 5)")
**Note on file naming:** the repo's `docs/session_5.md` is the user-committed
log of the interrupted session 3; this completion log therefore takes the next
free number.

## Scope

Refresh the workspace, re-review the docs (`AGENTS.md`, `CLAUDE.md`, `README`,
PAD, `fit-pro-gym_SKILL.md`, `docs/session_4.md`, `worklog.md`,
`docs/session_5.md`), then a fresh full-cycle parity audit against the live
reference — with the mobile navigation menu as the first-class citizen
(Tailwind v4 watch) — followed by TDD remediation, screenshots, docs, and
push to `main`.

## Audit method (fresh this session)

- Logged into the target with the provided credentials (saved session state
  still valid) and re-verified the mobile menu end-to-end: hamburger → X swap,
  menu structure (`md:hidden border-t border-white/10 bg-gray-900/90
  backdrop-blur-lg`, links + text-only Logout), route-change auto-close,
  active-pill semantics. **No Tailwind v4 bugs** — the clone's state-driven
  pattern behaved identically.
- Desktop + mobile VLM comparisons over Home / Memberships / Shop / Cart /
  Login: all MATCH after accounting for two capture artifacts (documented
  below).
- Queried the reference's base44 **entity API directly** (through the
  authenticated browser session) for ground-truth data: product and membership
  rows with their real `created_date` and flags.
- Read the reference's **network log** for its exact client queries, and its
  **JS bundle** for render algorithms.

## Root findings (3 defects)

| ID | Defect | Evidence |
|----|--------|----------|
| S5-R1 | The home plan preview's middle card is a **HARDCODED Pro Athlete** on the reference — its bundle renders `[e[0], n, e[1]]` over `Membership.list("-created_date", 3)`, where `n` carries FIVE design features (incl. "Premium equipment access", NOT the entity's six: no "Recovery room access", no "Mobile app with workout plans"), `color_scheme: "blue"`, and `popular: true`. The third fetched entity is discarded. The clone rendered the entity row (6 features). | bundle extraction + target DOM + entity API |
| S5-R2 | The reference's product entities ALL share one timestamp (2025-07-01T14:15:08.553Z); its `-created_date` tie order renders [Pre-Workout, Yoga Mat, Dumbbells, Whey] for both the home featured preview (`featured&-created_date&limit=4`) and the cross-sell dialog (`limit=3`). The clone's seed inserted products back-to-back (millisecond ties) — SQLite flipped the `createdAt desc` order non-deterministically. | entity API fetch + network log |
| S5-R2b | The reference's membership entities sit in TWO date groups (Basic Fit + Pro Athlete 2025-07-01; Starter + Family Pack 2025-07-30), so `Membership.list("-created_date", 3)` = [Family Pack, Starter, Pro Athlete] — session-3's hourly stagger had the wrong relative order (Pro newer than Starter). The rendered home result masked it because the entity Pro happened to land in the middle slot. | entity API fetch |

Data-hygiene note (unchanged stance): the reference's catalog still contains
the injected "XSS-INJECT-TEST" junk row (featured, newest) — deliberately
**not** part of this clone's seed; all order pins below are "reference minus
that row".

## Remediation (TDD — specs first)

1. **RED→GREEN unit:** `src/lib/home-featured-plan.ts` — `HOME_FEATURED_PLAN`
   (the hardcoded card, verbatim from the reference bundle) +
   `homePlanSlots()` (the `[e[0], n, e[1]]` slot algorithm); pinned by
   `src/lib/home-featured-plan.test.ts` (7 specs, incl. a guard that the
   hardcoded features never silently converge with the entity's).
2. **RED→GREEN e2e:** `home.spec.ts` — the plans-preview spec now pins the
   hardcoded middle card (exactly 5 `li`s, "Premium equipment access" present,
   the entity's two extra features absent) and a NEW shop-preview order spec
   [Pre-Workout, Yoga Mat, Dumbbells, Whey]; `memberships.spec.ts` — the
   cross-sell dialog now pins [Pre-Workout, Yoga Mat, Dumbbells].
3. **Seed:** plans reordered to creation order [Basic Fit, Pro Athlete,
   Starter, Family Pack] with `PLAN_CREATED` fixed dates mirroring the
   reference's real entity dates (tie groups 2025-07-01 / 2025-07-30, the
   reference's exact millisecond offsets breaking the ties in its own rendered
   order); products gained a 200ms `createdAt` stagger anchored at the
   reference's shared timestamp, pinning the featured desc order. Re-seeds are
   now fully deterministic (fixed dates, not run-relative).
4. **`plans-preview.tsx`** now routes through `homePlanSlots()`;
   `home-page.tsx` comments updated (the query itself was already correct).
5. Screenshots: all 13 re-captured under `docs/screenshots/` (populated cart,
   stepped-scroll settling for animated full-page shots).

## Capture artifacts worth remembering (VLM false positives)

- **Full-page screenshots + framer-motion `whileInView`:** a synchronous
  `scrollTo(bottom)` jump never intersects mid-page sections with the
  viewport, so their entrance animations never fire and full-page captures
  render them at `opacity: 0`. The fix is an **async stepped scroll**
  (~300px every ~80ms) — a synchronous for-loop of `scrollTo` calls is
  still one jump (no repaint between iterations).
- **Chromium reports Tailwind v4 oklch colors as `lab()`** — assert utility
  classes, not RGB values.

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 47/47 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 58/58 |
| Home plans preview vs reference | [Family, hardcoded-Pro(5 feats), Starter] exact |
| Home shop preview / cross-sell vs reference | [Pre-Workout, Yoga, Dumbbells, (Whey)] exact |
| Mobile menu behavior vs reference | identical (open/close/aria/route-change) |
| VLM desktop+mobile (Home/Memberships/Shop/Cart/Login) | MATCH |
