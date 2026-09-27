# Session 3 → 4 — Reference-Parity Remediation (Continuation)

**Session:** 3 (interrupted) + 4 (this continuation) · **Date:** 2026-09-27
**Scope:** Fresh parity audit against the live reference, TDD remediation of
9 root defects, docs refresh, and push to `main`.

## Where this session picked up

Session 3 completed the full audit + code remediation (R1–R10 below) and was
interrupted mid-documentation: `README.md` was updated, but `AGENTS.md`,
`CLAUDE.md`, the PAD, the SKILL file, and the session log were still pending,
and nothing was committed. Session 4 verified the working tree, finished the
documentation, re-ran every gate, and delivered.

## The audit (target = live base44 reference, logged in and re-audited)

| ID | Defect | Evidence |
|----|--------|----------|
| R1 | lucide-react 0.525.0 vs the reference bundle's **0.475.0** — 7 icons drifted (ShoppingBag, Dumbbell, Menu, LogOut, Mail, Search, Users) | bundle version string + SVG path-data diff; bisected npm versions |
| R2 | Memberships "Choose" buttons missing the ShoppingCart icon | target DOM extraction |
| R3 | `/login` redirected authenticated users; the reference renders the form | live test on the target |
| R4 | Login card: icon-chip logo vs the target's real 480×480 image, h1/subtitle classes, header structure, padding split, Google button, divider, bottom row, red Alert error "Invalid email or password" | full DOM extraction |
| R5 | `/signup` rendered a signup form; the target's `/signup` is its **404 page** | live test (HTTP 200 + 404 content — SPA shell) |
| R6 | No custom 404 page; the target has a branded one | live DOM |
| R7 | Page titles: "Your Cart \| …" → "Cart \| …", "Sign in \| …" → "FitPro GYM App" | title diff |
| R8 | Font stack: Tailwind 4.3.3 default (v3-style) vs the target's `ui-sans-serif, system-ui…` | computed styles + saved CSS |
| R9 | e2e specs pinned the wrong behaviors (redirect / link / error copy) | `auth.spec.ts` |
| R10 | Home plan preview order: the target renders `Membership.list("-created_date", 3)` — newest-first [Family, Pro, Starter], not "popular centered" | base44 API + target DOM |

## What was done (TDD — RED specs first, then GREEN)

1. **Rewrote the e2e specs** to pin the reference behavior (`auth`,
   `memberships`, new `icons` + `not-found` files, home-order pin) — 16 RED
   failures observed on the pre-fix build.
2. **R1** — `lucide-react` repinned to exactly **0.475.0**; icon geometry
   now locked by `tests/e2e/icons.spec.ts`.
3. **R2** — Choose buttons gained the reference's ShoppingCart icon.
4. **R3 + R4 + R7** — login card rebuilt to the reference's exact DOM: real
   logo asset (`public/login-logo.png`), Google button, OR divider, red
   shadcn-style `Alert` (new `src/components/ui/alert.tsx`) with the API copy
   changed to "Invalid email or password", absolute page title
   "FitPro GYM App", no auth redirect. Auth-form's signup mode removed.
5. **R5 + R6** — branded 404 surface: `src/lib/not-found-name.ts` (unit-pinned
   seam), `src/components/not-found-page.tsx`, `src/app/not-found.tsx`;
   `/signup` serves it with HTTP 200 (reference SPA behavior).
6. **R7** — Cart page title → "Cart".
7. **R8** — `--font-sans` pinned to the reference's stack in
   `src/app/globals.css`.
8. **R10** — home preview now runs the reference's query (three newest plans
   by `createdAt` desc); `prisma/seed.ts` reordered to the reference's
   creation order with an hourly `createdAt` stagger (SQLite millisecond
   ties flip `desc` — the stagger makes ordering deterministic).
9. **R10 (screenshots)** — 13 captures under `docs/screenshots/` (incl. the
   new `signup-404.png` and retaken mobile-menu/cross-sell shots).
10. **Docs** — README (session 3), AGENTS/CLAUDE/PAD/SKILL + this file
    (session 4); PAD at v1.2 with the parity ledger extended (Login, 404,
    Icons, Home preview rows).

## Operational findings worth remembering

- **Full-page screenshots + framer-motion don't mix** — `whileInView`
  sections render at `opacity: 0` mid-capture; scroll through the page (or
  inject CSS that finalizes motion states) before comparing via VLM.
- **Tailwind v4 color output is oklch** — Chrome reports `bg-slate-50` in
  `lab()`/`oklch()`; don't assert RGB equality, assert the utility class.
- **Next.js route announcer collides with `role="alert"`** — scope alert
  locators to the form card.
- **The reference's `/signup` serves HTTP 200 with 404 content** (SPA shell)
  — unknown routes in the clone keep a real HTTP 404; only `/signup` mirrors
  the 200 behavior, pinned by spec.
- **SQLite timestamp ties** — back-to-back `create()` calls can share a
  millisecond; `createdAt desc` then flips on rowid. Stagger explicit
  `createdAt` values when order matters.

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 40/40 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 57/57 |
| Icon path data vs reference bundle | exact match (0.475.0) |
| Home preview order vs reference | [Family $149, Pro $59, Starter $29] |
| Login/404/mobile VLM comparisons | MATCH |
