---
name: fit-pro-gym
description: >
  Complete engineering skill for the FitPro GYM App codebase — a Next.js 16
  clone of the base44 reference (gym memberships + fitness store + cart +
  checkout). Captures the architecture, Tailwind v4 CSS-first design system,
  reference-parity contracts, auth/cart invariants, testing strategy,
  anti-patterns, and hard-won debugging knowledge. Use this to extend, debug,
  onboard, or replicate the codebase.
version: 1.6.3
last_updated: 2026-09-29
project_state: 47 unit tests + 74 e2e specs green, lint/typecheck/build clean, reference-parity re-verified (session 11 — ZERO defects, third consecutive clean cycle: tie order re-audited STABLE at [Yoga, Dumbbells, Pre, Whey] (junk row still displacing Whey); mobile nav verified a 7th consecutive session, zero Tailwind v4 bugs; all 12 screenshots re-captured with dimensions matching the prior batch exactly)
tags:
  - nextjs
  - tailwind-v4
  - prisma
  - sqlite
  - reference-parity
  - e-commerce
---

# FitPro GYM App — Engineering SKILL

> **How to use this document:** §1–§8 give you the map (what this is, how it's
> built). §9–§16 are the "don't get burned" sections (anti-patterns, debugging,
> checklists, lessons). §17–§20 are the reference tables you'll grep while
> coding. Everything is codebase-verified — every file path exists, every
> count matches the test runner, every token matches `globals.css`.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (CSS-First Tailwind v4)](#4-the-design-system-css-first-tailwind-v4)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [State, Data & Custom Patterns Deep Dive](#6-state-data--custom-patterns-deep-dive)
7. [Domain Model & Ingestion (Seed)](#7-domain-model--ingestion-seed)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color & Token Reference (Complete)](#19-color--token-reference-complete)
20. [The Complete TypeScript Interface Reference](#20-the-complete-typescript-interface-reference)
- [Appendix A: The Meticulous Approach (workflow)](#appendix-a-the-meticulous-approach)
- [Appendix B: Quick Reference Card](#appendix-b-quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**One sentence:** A self-hosted, production-grade clone of the FitPro GYM App
reference (`https://fit-pro-gym-app-c6cbb3a3.base44.app/`) — gym marketing
site + membership catalog + fitness store + per-user cart + checkout — rebuilt
as a single Next.js 16 App Router application with Prisma/SQLite and cookie
auth, with **visual and behavioral parity to the reference as a first-class
contract**.

**Design thesis:** dark premium athleticism — gray-900 canvas, glass cards
(`bg-white/5` + backdrop-blur), neon gradient accents (sky→emerald), and
framer-motion "speed line" energy. The reference's exact Unsplash imagery,
toast copy, and URL casing are part of the product.

**Non-negotiable rules:**
1. **Parity beats taste.** Class strings extracted from the reference's live
   DOM (speed lines, badges, toolbar, cards) are contract data — pinned by
   tests (`src/lib/speed-lines.test.ts`, `src/lib/shop-categories.test.ts`,
   `tests/e2e/home.spec.ts`). Don't "improve" them without updating the test
   in the same commit.
2. **Server is the single source of truth.** Every cart/order mutation is
   owner-checked server-side; the client re-fetches after every mutation.
3. **Tailwind v4 CSS-first, forever.** No `tailwind.config.*` will ever exist.
4. **The mobile menu is state-driven, never the `hidden` attribute.**
5. Capitalized routes (`/Home`, `/Memberships`, `/Shop`, `/Cart`) mirror the
   reference; `/login`, `/signup` are lowercase. Do not normalize. `/signup`
   deliberately renders the reference's branded 404 (its route was never
   built); `/login` renders for authenticated users (no redirect).

**The CTA hierarchy:** hero "Start Your Journey" (blue-600 solid) → plan
"Choose {name}" (per-tier gradient) → product round add buttons → cart
"Complete Order - $X".

---

## 2. Tech Stack & Environment

| Layer | Technology | Version (package.json) | Critical note |
|-------|-----------|------------------------|---------------|
| Framework | next | ^16.3.6 | App Router + Turbopack, `output: "standalone"` |
| UI runtime | react / react-dom | ^19.3.0 | ref props; no forwardRef wrappers |
| Language | typescript | ^5.9.3 | strict (noImplicitAny off — scaffold decision) |
| Styling | tailwindcss + @tailwindcss/postcss | ^4.3.3 | CSS-first; tokens in globals.css |
| Components | Radix primitives, shadcn-style | current | `src/components/ui/*` |
| Animation | framer-motion | ^13.4.4 | `useReducedMotion` guards required |
| Icons | lucide-react | **0.475.0 (pinned)** | the reference bundle's exact build version — 0.5xx redesigns 7 icons; geometry e2e-pinned |
| ORM | prisma + @prisma/client | ^6.19.3 | SQLite; JSON-string lists |
| DB | SQLite | — | `db/custom.db` (dev), `db/e2e.db` (e2e) |
| State | zustand (dep) + custom AppProvider | ^5.0.15 | AppProvider is the real pattern |
| Unit tests | vitest | ^5.0.1 | `*.test.ts` only |
| E2E | @playwright/test | ^1.63.0 | standalone build on :3100 |
| Runtime | Bun | ≥1.1 | dev/build/start/seed scripts |

**Verify:** `bun install && bun run db:push && bun run db:seed && bun run dev`
→ `curl localhost:3000/api/health` → `{"status":"ok","app":"fit-pro-gym"}`.

---

## 3. Bootstrapping & Configuration

**Scaffold:** clone this repo (it IS the scaffold — do NOT run generic
`init-fullstack.sh`-style generators over it; the config stack is complete).

**Config files (all deliberate):**
- `next.config.ts` — `output: "standalone"` + `allowedDevOrigins` (sandbox
  preview). The build script copies `static/`, `public/`, and
  `prisma/schema.prisma` into `.next/standalone/` — the schema copy anchors
  production db-path detection (removing it breaks the standalone server with
  SQLite error 14).
- `tsconfig.json` — strict, `@/*` → `src/*` alias.
- `eslint.config.mjs` — flat config; enforces
  `react-hooks/set-state-in-effect`.
- `vitest.config.ts` — node env, includes `src/**/*.test.ts` +
  `tests/**/*.test.ts` (never `*.spec.ts` — those are Playwright's).
- `playwright.config.ts` — 2 projects (`setup` signs in once → storageState
  `tests/e2e/.auth/user.json`; `chromium` replays it), globalSetup pushes +
  seeds `db/e2e.db`, webServer runs the STANDALONE build on :3100 with
  `DATABASE_URL="file:../db/e2e.db"` + a fixed `AUTH_SECRET`.
- `postcss.config.mjs` — `@tailwindcss/postcss` (required for v4; its absence
  500s every page).

**Environment variables (4, see `.env.example`):**

| Var | Required | Behavior |
|-----|----------|----------|
| `DATABASE_URL` | yes | `file:../db/custom.db` — RELATIVE, resolves against `prisma/schema.prisma` via `src/lib/db-path.ts` (15 test-pinned specs). Exported shell env BEATS `.env` — prefix commands in hijacking sandboxes. |
| `AUTH_SECRET` | prod | HMAC key; falls back to an insecure dev constant when unset. |
| `NEXT_PUBLIC_SITE_URL` | no | feeds `metadataBase` in `src/app/layout.tsx`. |
| `ALLOWED_DEV_ORIGIN` | no | permits an external dev preview host for dev assets. |

**Commands:** `dev`, `build`, `start`, `lint`, `typecheck`, `test`,
`test:e2e`, `db:push`, `db:generate`, `db:seed`, `db:migrate`, `db:reset`.
Verification order: **lint → typecheck → test → build → test:e2e**.

---

## 4. The Design System (CSS-First Tailwind v4)

Everything lives in `src/app/globals.css` (197 lines + vendored
`tw-animate-vendored.css`). **There is no `tailwind.config.*` and creating one
regresses the repo.**

**Brand tokens (the reference's exact values):**

| Token | Value | Utility family |
|-------|-------|----------------|
| `--gym-primary` | `#0ea5e9` (sky) | `bg-gym-primary`, `text-gym-primary`, … |
| `--gym-secondary` | `#10b981` (emerald) | `gym-secondary` |
| `--gym-dark` | `#1f2937` | `gym-dark` |
| `--gym-accent` | `#f59e0b` (amber) | `gym-accent` |

**shadcn HSL set:** `--background`, `--foreground`, `--card`, `--primary`,
`--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`,
`--ring`, `--radius: 0.5rem` — dark values (background `0 0% 3.9%`) exposed to
Tailwind via the `@theme inline` block (`--color-*` mappings +
`--radius-sm/md/lg/xl` calc chain).

**Typography:** the reference's sans stack (`ui-sans-serif, system-ui,
sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
'Noto Color Emoji'`) — pinned explicitly in `globals.css` as `--font-sans`
(Tailwind ≥ 4.1 ships a different v3-style default; the reference was built
with v4's early default). Hierarchy: h1 `text-4xl md:text-6xl font-bold`; section h2
`text-3xl md:text-4xl font-bold` (gradient `bg-clip-text` on marketing
headings); card h3 `text-2xl font-bold`; body `text-sm`–`text-xl`.

**Keyframes/animations:** framer-motion variants only (speed lines, card
entrances, hover lifts, toasts) + vendored `tw-animate-*` utilities. A
`prefers-reduced-motion` guard exists in CSS and in every animated component
(`useReducedMotion`).

**Signature surfaces (extracted from the reference's DOM — parity contract):**
- **Speed lines** — 8 full-width streaks per hero (6 glow: colored shadow +
  blur, 2 solid: `via-blue-300`/`via-green-300` opacity-90). Specs in
  `src/lib/speed-lines.ts`, rendered by `src/components/ui/speed-lines.tsx`.
- **Hero canvas** — `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`
  + `bg-black/50` scrim + `from-blue-600/20 to-green-600/20` tint.
- **Glass cards** — `bg-white/5 backdrop-blur-lg border-{color}-500/30
  rounded-2xl p-8` with a `-inset-px` 400px cursor spotlight.
- **Sticky shop toolbar** — `bg-slate-800/80 backdrop-blur-sm border
  border-slate-700 rounded-2xl p-4 sticky top-20 z-40`.

---

## 5. Component Architecture & Patterns

**Layers (imports flow downward only):**

```
src/app/            routes (server components by default) + API handlers
src/components/     ui/ (primitives) → feature folders (client islands)
src/lib/            db, auth, serialize, utils, speed-lines, shop-categories, not-found-name, home-featured-plan
prisma/             schema + seed
tests/              e2e specs + db-path contract
```

**Counts:** 24 component files — 19 `"use client"`, 5 server. 7 lib modules
(+3 test files). 7 page routes, 11 API route handlers.

**Client/server decision tree:** a file becomes `"use client"` only when it
needs state/effects/motion. Catalog pages (`Home`, `Shop`) read Prisma
server-side and pass DTOs to client islands (`home-page.tsx` →
`Hero`/`WhyChoose`/…; `shop/page.tsx` → `ShopPage`).

**Feature folders:**

| Folder | Files | Purpose |
|--------|-------|---------|
| `components/ui/` | alert, badge, button, card, dialog, input, label, select, skeleton, speed-lines | shadcn-style primitives + the shared streak renderer |
| `components/home/` | hero, why-choose, plans-preview, shop-preview, cta-section, home-page | landing composition |
| `components/memberships/` | memberships-page, membership-card | rail + cross-sell dialog + home plan card |
| `components/shop/` | shop-page | toolbar + grid + product card |
| `components/cart/` | cart-page | rows, steppers, summary, checkout |
| `components/layout/` | header, footer, toaster | app chrome |
| `components/auth/` | auth-form | the reference's login card (real logo asset, Alert errors, no auth redirect) |
| `components/not-found-page.tsx` | — | the reference's branded 404 surface (served by `/signup` + unknown routes) |
| `components/providers.tsx` | — | AppProvider (user + cart count + toasts) |

**The golden rule:** client components never import `@/lib/db`; only route
handlers and server pages do. DTOs cross the boundary via
`src/lib/serialize.ts`.

---

## 6. State, Data & Custom Patterns Deep Dive

**AppProvider (`src/components/providers.tsx`)** — the ONLY client state
container: `{ user, cartCount, refreshCart, showToast }`. `refreshCart()`
re-fetches `/api/cart/count` after every mutation (server is truth);
`showToast(type, message)` renders a single-slot toast, 3s auto-dismiss.

**Money math (`src/lib/utils.ts`)** — `cartTotal` computes in integer cents;
`formatPrice` renders `$X`. Naive float `reduce(price * qty)` corrupts orders
(`0.1 + 0.2`) — pinned by `src/lib/utils.test.ts`.

**Auth (`src/lib/auth.ts`)** — scrypt `salt:hash` hex passwords; HMAC-SHA256
signed cookie `fitpro_session` (base64url body + sig, 7-day exp); in-process
rate limiter (10 fails / 15 min / IP → 429 + `Retry-After`). `getSessionUser()`
reads via `next/headers` — server-only.

**db-path (`src/lib/db-path.ts`)** — relative `file:` URLs resolve against the
first anchor containing `prisma/schema.prisma` (CLI-identical semantics);
`standaloneRepoRoot()` detects `.next/standalone` and walks up two levels.
15 specs in `tests/db-path.test.ts` pin this — never "simplify" it.

**Cart dedupe** — app-level: POST `/api/cart` filters the caller's cart for
the same (user, itemType, itemId); a hit bumps quantity and returns
`duplicated: true` (toast "Membership already in your cart!"); the
`@@unique([userEmail, itemType, itemId])` constraint is defense in depth.

**Checkout** — POST `/api/orders` re-reads cart rows server-side, recomputes
totals with `cartTotal`, creates the Order + clears the cart inside
`prisma.$transaction`.

---

## 7. Domain Model & Ingestion (Seed)

**Prisma models (`prisma/schema.prisma`, SQLite):** `User`, `MembershipPlan`,
`Product`, `CartItem`, `Order` — mirroring the reference's base44 entities
1:1. Structured fields (`features`) are JSON strings on SQLite (no scalar
lists); parsing happens ONLY in `src/lib/serialize.ts`.

**Seed (`prisma/seed.ts`) — full reset (deleteMany → create):**

| Entity | Rows | Notes |
|--------|------|-------|
| User | 1 | `demo@fitpro.app` / `Demo1234!` |
| MembershipPlan | 4 | Starter $29 (orange), Basic Fit $39 (blue), Pro Athlete $59 (green, popular — 6 features incl. Recovery room access), Family Pack $149 (purple). Fixed `PLAN_CREATED` dates mirror the reference's real entity dates (two tie groups: 2025-07-01 / 2025-07-30) |
| Product | 4 | The reference's REAL entity data (all featured): Pre-Workout Energy $34 (supplements), Yoga Mat Premium $79 (accessories), Professional Dumbbells Set $299 (equipment), Whey Protein Powder $49 (supplements). 200ms `createdAt` stagger pins the featured `-created_date` tie order — which is SERVER-DRIFTABLE: re-audited live 2026-09-29 (sessions 8–11) at [Yoga Mat, Dumbbells, Pre-Workout, Whey] (flipped from the session-5 order; the reference's featured XSS junk row, created 2026-05-15, now displaces Whey from its limit-4 window). Session-6 removed 4 invented demo rows that never existed on the reference |

Run: `DATABASE_URL="file:../db/custom.db" bun run db:seed` (the prefix guards
against shell-env hijack). The reference's injected "XSS-INJECT-TEST" junk row
is deliberately not cloned.

---

## 8. Accessibility Implementation

- Semantic landmarks: `header` (sticky), `nav[aria-label="Primary"]`,
  `main`, `footer`.
- Mobile hamburger: `aria-label` flips Open/Close navigation menu,
  `aria-expanded`, `aria-controls="mobile-navigation"`; the menu is
  conditionally RENDERED (never the `hidden` attribute — Tailwind v4: the
  attribute beats display utilities).
- Nav links: `aria-current="page"` on the active route (exact pathname match —
  on `/` no link is active, matching the reference).
- Icon-only buttons carry `aria-label` (add-to-cart, cart link "Cart, N items").
- All decorative SVGs: `aria-hidden`. Spotlight/blur layers: `aria-hidden`.
- `prefers-reduced-motion`: CSS guard + `useReducedMotion()` in every animated
  component (speed lines park off-screen).
- Mobile menu links: px-3 py-3 → ≥44px touch targets (pinned by e2e).
- Toasts: single live region, 3s auto-dismiss.

---

## 9. Anti-Patterns & Common Bugs

| # | Anti-pattern | Real consequence | Do this instead |
|---|--------------|------------------|-----------------|
| 1 | `hidden` attribute on the mobile menu | v4: attribute overrides `display` utilities → menu stuck | Conditional render from state (`menuOpen ? <div/> : null`) |
| 2 | `<Link to=…>` (React Router idiom) | Every page 500s — Next.js Link takes `href` | `href` |
| 3 | Creating `tailwind.config.js` | v4 CSS-first contract broken; dual source of truth | Tokens in `globals.css` `@theme inline` |
| 4 | Dynamic class fragments (`top-[${x}]`) | Tailwind's scanner can't see it → no CSS generated | Full class strings in data (see `speed-lines.ts`) |
| 5 | `JSON.parse(features)` outside `serialize.ts` | Double-parse/type drift, crashes on null | `serializeMembership` |
| 6 | Float money math (`price * qty` reduce) | 0.1+0.2 corruption in totals | `cartTotal` (integer cents) |
| 7 | Constructing a second `PrismaClient` | SQLite handle exhaustion | Import the singleton from `@/lib/db` |
| 8 | Trusting client-supplied cart totals/prices at checkout | Order forgery | Recompute from DB rows in the transaction |
| 9 | Per-test UI logins in e2e | Rate limiter (10/15min) trips mid-suite | storageState via the `setup` project |
| 10 | Starting the dev server without `DATABASE_URL` prefix in a hijacking shell | App silently reads an empty DB → 401 logins | `DATABASE_URL="file:../db/custom.db" bun run dev` |
| 11 | Removing the `mkdir -p .next/standalone/prisma` from build | Standalone db-path detection fails → SQLite error 14 | Keep the build script's copies |
| 12 | `setMenuOpen` in an effect on pathname change | ESLint `react-hooks/set-state-in-effect` blocks it | Render-time adjustment (track prev pathname, set state during render) |
| 13 | "Normalizing" capitalized routes | Breaks reference parity + e2e + links | Keep `/Home`, `/Memberships`, `/Shop`, `/Cart` |
| 14 | Editing the speed-line/category specs without their tests | Silent parity drift | Update `.test.ts` in the same commit |
| 15 | Importing `tw-animate-css` bare | Turbopack can't resolve its `style` export condition | Import `src/app/tw-animate-vendored.css` |
| 16 | Upgrading lucide-react past 0.475.0 | 7 icons get redesigned geometry (bag, dumbbell, menu, logout…) → visual drift from the reference | Keep the exact pin; `tests/e2e/icons.spec.ts` guards it |
| 17 | Deleting the `--font-sans` pin in `globals.css` | Tailwind ≥ 4.1's default stack changes body font metrics on every page | Keep the reference's `ui-sans-serif, system-ui, …` pin |
| 18 | Reordering the seed's plan/product arrays or touching `PLAN_CREATED` / the product stagger | SQLite ties flip `createdAt desc` → preview/cross-sell order drifts; the home middle card's features converge with the entity's | Keep the arrays + fixed dates; the home-featured-plan tests pin the contract |
| 19 | "Fixing" `/signup` into a real signup form or redirecting authed `/login` | Breaks reference parity (its SPA serves 404 at /signup; it renders the login card when authed) | Keep `NotFoundPage` at signup; no redirect on login |

---

## 10. Debugging Guide

| Symptom | Likely cause | Diagnostic → fix |
|---------|-------------|------------------|
| Login 401 with correct demo password | DB env hijack — app reads an empty absolute-path DB | `tr '\0' '\n' < /proc/$(pgrep -f 'next dev')/environ | grep DATABASE` → restart with the relative URL prefixed |
| Every page 500 with `Cannot find module '.prisma/client/default'` | Prisma client not generated after fresh install | `bunx prisma generate` |
| Styles missing for a dynamic element | Class built from fragments → scanner never saw it | Full class strings in data; check computed style in the DOM |
| E2E fails with SQLite error 14 | Standalone build lacks the traced `prisma/schema.prisma` | `bun run build` (script copies it); don't strip the copy steps |
| E2E 429 on login | Per-test logins tripped the rate limiter | storageState project; keep real logins < 10/15 min |
| Menu won't close after navigation | Effect-based close was refactored to something async | Render-time prev-pathname adjustment in `header.tsx` |
| Icons look subtly "newer" than the reference | lucide-react drifted past 0.475.0 | `bun install` with the pin restored; check `tests/e2e/icons.spec.ts` path data |
| Icons specs fail with 0.5xx path data while unit tests stay green | node_modules out of sync with bun.lock after a workspace re-clone (observed: 0.525.0 installed vs 0.475.0 pinned) | `grep version node_modules/lucide-react/package.json` → `rm -rf node_modules/lucide-react && bun install --frozen-lockfile` → REBUILD before e2e (the standalone bundle compiles whatever is in node_modules) |
| Shop price rows float above the card bottom on rows with a 2-line product name | Card body lost `flex flex-col justify-between` | e2e "product cards pin price rows" spec pins the 16px row gap; restore the reference body classes |
| "Apparel" category filter shows a card | An invented product reintroduced (the reference's real catalog has NO apparel products) | The seed is the reference's exact 4-product entity data; "Apparel" must hit the reference's single-paragraph empty state |
| Home preview cards in the wrong order | Seed `createdAt` values tied at the same millisecond | Re-seed (fixed dates); verify `ORDER BY createdAt DESC` |
| Home Pro card shows six features / missing "Premium equipment access" | The preview is rendering the ENTITY row instead of the hardcoded card | `homePlanSlots` (src/lib/home-featured-plan.ts) replaces the middle slot — don't bypass it |
| Login error text mismatch | API copy diverged from the reference's alert | The string is "Invalid email or password" — pinned by `auth.spec.ts` |
| Toast text "wrong" | Copy is a parity contract | Exact strings live in the components + `CLAUDE.md` list |
| Speed lines look stacked at top | Missing `top-[N%]` utilities OR the `absolute` class (session-7 find: the component had omitted `absolute` — 8 in-flow lines inflated both heroes 48px while still animating, so text audits never caught it) | Verify `getComputedStyle(line).position === 'absolute'`; specs in `speed-lines.ts` + the e2e hero-height/position pins |
| A shadcn color utility renders as the text/border color instead of its token (e.g. placeholder shows currentColor) | The `@theme inline` mapping lacks the `hsl()` wrapper — HSL-triplet vars are invalid bare color values | `--color-muted-foreground: hsl(var(--muted-foreground))`; check the generated rule resolves to a real color |
| Hero h1/lede taller than the reference | v3 vs v4 cascade: `md:text-6xl` + `leading-tight` — v3 lets the text size's own line-height win | `md:leading-none` (h1) / `md:leading-[2rem]` (lede) — pinned by the e2e computed-line-height specs |
| Buttons show the default arrow cursor | The reference's `button,[role=button]{cursor:pointer}` base rule was removed | Restore it in `globals.css` `@layer base` |
| Login card height off by ~12px | v4 `space-y` margin-bottom on the preceding INLINE label is ignored (v3 put margin-top on the block wrapper) | `mt-1.5` on the input wrappers; check the e2e field-gap spec |
| Dev server dies between shell commands (sandbox) | Process reaper kills tool-call children | Double-fork daemonize: `( ( exec setsid CMD > log 2>&1 < /dev/null ) & )` |

---

## 11. Pre-Ship Checklist

```bash
bun run lint          # clean
bun run typecheck     # clean
bun run test          # 47/47
bun run build         # standalone compiles
bun run test:e2e      # 74/74
```

Then the human-pass list:
- [ ] Mobile menu: opens (aria-expanded), links navigate, auto-closes on route change, no `hidden` attribute in the DOM (`#mobile-navigation` count 0 when closed)
- [ ] `/` renders Home, `/Home` marks the nav pill, `/` marks none
- [ ] Hero shows 8 animated lines over the gradient canvas, every line `position:absolute`, hero section 840px at desktop
- [ ] Buttons show the pointer cursor everywhere (the reference's base rule)
- [ ] Memberships: Crown badge ≈65px from the card top; rail scrolls horizontally
- [ ] Shop: toolbar sticks under the header on scroll; category dropdown is Title Case; filter actually filters; hero h1 renders 48px (`md:text-5xl`); search placeholder reads #737373
- [ ] Cart: add → badge bumps + exact toast; checkout clears cart + success toast + redirect; checkout placeholders read #737373
- [ ] Login: renders while authenticated; bad credentials → red Alert "Invalid email or password"; page title is the absolute "FitPro GYM App"; labels are plain `text-sm font-medium` (20px line-height), card 746px
- [ ] `/signup` shows the branded 404 (HTTP 200); unknown route → 404 page + HTTP 404
- [ ] Home plan preview: Family Pack → HARDCODED Pro Athlete (5 features incl. "Premium equipment access") → Starter; the middle card ignores the entity row; the "View All Plans" CTA is a solid blue default-size button (h-10, text-sm)
- [ ] Home shop preview: Pre-Workout → Yoga Mat → Dumbbells → Whey; cross-sell shows the first three of those
- [ ] lucide-react still pinned at 0.475.0 (icon paths unchanged)
- [ ] `.env` never committed with secrets (the committed one is template-only); `db/*.db` and `tests/e2e/.auth/` are git-ignored

---

## 12. Lessons Learnt & How to Avoid Them

| # | Lesson | Origin |
|---|--------|--------|
| 1 | Extract parity specs from the LIVE DOM, not from memory of the bundle — the reference's pages differ subtly (home hero vs memberships hero line positions; Star vs Crown badges). | Session-2 audit |
| 2 | Trust the DOM over the VLM: one "prices cut off in the original" was a screenshot crop; one "thick line at the top" was animation timing. Always diff classes. | Session-2 audit |
| 3 | `DATABASE_URL` in a sandboxed shell beats `.env` (dotenv precedence) — document the prefix, verify via `/proc/<pid>/environ`. | Session-2 ops |
| 4 | Background processes need true daemonization to survive tool-call reapers. | Session-2 ops |
| 5 | Pin visual parity in TESTS (unit for spec data, e2e for rendered classes) — screenshots rot, class assertions don't. | Session-2 TDD |
| 6 | A referenced-but-unwired env var (`NEXT_PUBLIC_SITE_URL`) is a doc bug: wire it or remove it. | Session-2 docs |
| 7 | Seed data rots: verify every remote image URL with a HEAD request before shipping. | Session-2 seed fix |
| 8 | The reference's `-created_date` tie order is server-side state, not a contract — it flipped between sessions with zero entity edits. Re-query the entity API every audit cycle and re-pin the stagger + e2e order pins when it moves. | Session-8 audit |
| 9 | When a fact lives in MULTIPLE doc locations, grep for EVERY occurrence before calling the edit done — session 8 re-pinned the tie order in 5 of 6 places and left PAD §15's "Home shop preview / cross-sell" row stale, shipping an internally inconsistent "definitive" reference that session 9 had to catch. Cross-doc consistency is itself a pinned surface. | Session-9 audit |

---

## 13. Pitfalls to Avoid

- Don't add a `tailwind.config.*`, `corePlugins`, `safelist`, or `content`
  array — v4 does content detection automatically.
- Don't paraphrase toast copy ("Product added to cart!", "Membership already
  in your cart!", "Quantity updated in cart!", "Item removed from cart",
  "Order placed successfully! You will receive a confirmation email shortly.").
- Don't lowercase/normalize routes or the e2e suite and header/footer links
  break.
- Don't render the mobile menu with `style={{display:'none'}}` toggling or the
  `hidden` attribute — conditional render only.
- Don't put py on BOTH the hero section and its inner container — the
  reference keeps padding on the inner only.
- Don't derive the category dropdown from product data (lowercase, drifting)
  — it's the reference's hardcoded Title Case list.
- Don't add per-test logins or remove the storageState project.
- Don't commit `.env` with a real `AUTH_SECRET`, `db/*.db`, or
  `tests/e2e/.auth/`.

## 14. Best Practices

- Change contract data (speed lines, categories, toast copy, routes) only with
  the pinning test updated in the same commit.
- Arrange e2e state through the API (`page.request`), never the UI — the UI
  path is the thing under test.
- Exercise any changed UI flow in a real browser (agent-browser/Playwright);
  unit tests don't cover components.
- One change, one verification — keep failures localizable.
- Server components by default; `use client` only for state/effects/motion.
- Annotate public boundaries (route handlers, exported lib functions).
- Full class strings in JSX (template interpolation of COMPLETE strings is
  fine — constructing class names from fragments is not).
- Re-run `bun run test` after touching any `src/lib/*.ts` — five of the seven
  modules are contract-pinned.

## 15. Coding Patterns

**Speed lines (data-driven animation, scanner-safe):**

```ts
// src/lib/speed-lines.ts — full utilities as data (Tailwind sees the literals)
export const HERO_SPEED_LINES: SpeedLine[] = [
  { top: "top-[20%]", height: "h-1", gradient: "from-transparent via-cyan-400 to-transparent",
    opacity: "opacity-60", shadow: "shadow-[0_0_20px_#22d3ee]", blur: "blur(1px)",
    duration: 12, delay: 0 },
  // … 8 total
];
```

```tsx
// src/components/ui/speed-lines.tsx — one renderer, reduced-motion aware
<motion.div key={i} aria-hidden
  className={cn(`${line.top} ${line.height} w-full bg-gradient-to-r ${line.gradient} ${line.opacity}`, line.shadow)}
  style={line.blur ? { filter: line.blur } : undefined}
  initial={reduced ? { x: "200vw" } : { x: "100vw" }}
  animate={reduced ? { x: "200vw" } : { x: "-100vw" }}
  transition={reduced ? { duration: 0 } : { duration: line.duration, delay: line.delay, repeat: Infinity, ease: "linear" }}
/>
```

**Render-time route-change close (the ESLint-approved pattern):**

```tsx
const [prevPathname, setPrevPathname] = React.useState(pathname);
if (pathname !== prevPathname) {           // adjust state DURING render…
  setPrevPathname(pathname);
  if (menuOpen) setMenuOpen(false);        // …React re-renders immediately, no effect
}
```

**Case-insensitive hardcoded category filter:**

```ts
export function categoryMatches(productCategory: string, filter: string): boolean {
  if (filter === "all") return true;
  return productCategory.toLowerCase() === filter.toLowerCase();
}
```

**Owner-checked mutation (cart PATCH):**

```ts
const user = await getSessionUser();               // server-side session read
const line = await prisma.cartItem.findUnique({ where: { id } });
if (!line || line.userEmail !== user.email) return 404/403;
```

## 16. Coding Anti-Patterns

```tsx
// ❌ fragment-built class — scanner-blind
<div className={`top-[${line.top}] h-${n}`} />
// ✅ full strings from data
<div className={`${line.top} ${line.height} w-full …`} />

// ❌ effect-based close
React.useEffect(() => setMenuOpen(false), [pathname]);
// ✅ render-time adjustment (see §15)

// ❌ client-side money
total = items.reduce((s, i) => s + i.price * i.quantity, 0);
// ✅ cartTotal(items) — integer cents

// ❌ trusting the client at checkout
await prisma.order.create({ data: { total: body.total } });
// ✅ re-read rows, recompute, transact (see /api/orders)
```

---

## 17. Responsive Breakpoint Reference

| Breakpoint | What changes |
|-----------|--------------|
| base (<768) | mobile chrome: hamburger (`md:hidden`) + collapsible menu; single-column grids; toolbar stacks (`grid-cols-1`) |
| `md` (768) | desktop nav (`hidden md:flex`) + user cluster appear; hamburger/menu unmount; grids → 2 cols; toolbar → 2 cols |
| `lg` (1024) | hero 2-col split; plans 3 cols; shop grid 4 cols; toolbar 4 cols with search `lg:col-span-2`; rail cards `sm:w-[320px]` |
| `xl` (1280) | shop grid stays 4 cols at `xl:grid-cols-4`; max-w-7xl containers |

Reference mobile viewport: **390×844** (what the e2e mobile specs and the
reference recon used).

## 18. Z-Index Layer Map

| Layer | Value | Element |
|-------|-------|---------|
| Content popovers | `z-[100]` | Radix Select/Dialog portals |
| Header | `z-50` | `sticky top-0` header (+ its cart badge) |
| Shop toolbar | `z-40` | `sticky top-20` filter card (sits under the header) |
| Section content | `z-10` | hero/why-choose content wrappers over decorative layers |
| Decorative | (none) | speed lines, glow blobs, scrims, spotlights |

Rule: interactive sticky surfaces stack header(50) > toolbar(40) > content(10);
portals always win (100).

## 19. Color & Token Reference (Complete)

| Token / class | Value | Where |
|---------------|-------|-------|
| `--gym-primary` | `#0ea5e9` | globals.css:54 |
| `--gym-secondary` | `#10b981` | globals.css:55 |
| `--gym-dark` | `#1f2937` | globals.css:56 |
| `--gym-accent` | `#f59e0b` | globals.css:57 |
| `--background` (dark) | `0 0% 3.9%` | globals.css:61 |
| `--radius` | `0.5rem` (sm/md/lg/xl calc) | globals.css:18, 116–119 |
| Canvas | `bg-gray-900` | app shell |
| Hero canvas | `from-gray-900 via-gray-800 to-gray-900` + black/50 scrim + blue-green tint | hero.tsx |
| Why-Choose canvas | `from-slate-900 via-slate-800 to-slate-900` + tint + blobs | why-choose.tsx |
| Plans canvas | `bg-slate-900` | plans-preview.tsx |
| Shop preview canvas | `from-slate-900 to-black` + purple/teal blobs | shop-preview.tsx |
| CTA canvas | `bg-gray-800` + blue→green gradient overlay | cta-section.tsx |
| Plan gradients | blue/green/purple/orange `from-X-500 to-X-600` | membership-card.tsx |
| Toast palette | `bg-green-500/20` / `bg-red-500/20` / `bg-blue-500/20` | toaster |
| Cart badge | `bg-blue-500 border-2 border-gray-800` | header |
| Speed line colors | cyan-400, blue-500, yellow-400, green-400, blue-400, teal-400 (+ blue-300/green-300 solid) | speed-lines.ts |

## 20. The Complete TypeScript Interface Reference

```ts
// src/components/providers.tsx (DTO boundary)
interface MembershipDTO { id: string; name: string; price: number; description: string | null;
  features: string[]; popular: boolean; colorScheme: string; }
interface ProductDTO { id: string; name: string; price: number; description: string | null;
  category: string; imageUrl: string | null; featured: boolean; stock: number; }

// src/lib/auth.ts
interface SessionUser { id: string; email: string; name: string; }
interface SessionPayload { uid: string; email: string; name: string; exp: number; }

// src/lib/speed-lines.ts
interface SpeedLine { top: string; height: "h-1" | "h-2"; gradient: string; opacity: string;
  shadow?: string; blur?: string; duration: number; delay: number; }

// src/lib/utils.ts
function cartTotal(items: { price: number; quantity: number }[]): number  // cents
function formatPrice(cents: number): string

// src/lib/shop-categories.ts
const SHOP_CATEGORIES: readonly ["Equipment", "Supplements", "Accessories", "Apparel"]
function categoryMatches(productCategory: string, filter: string): boolean

// API shapes (src/app/api/**)
POST /api/cart     → { item: CartItem } | { item, message, duplicated: true }
POST /api/orders   → { order: Order }  (404 on empty cart)
POST /api/auth/*   → { user: SessionUser } | { error: string }
```

---

## Appendix A: The Meticulous Approach (workflow)

1. **Read before writing** — the file you're editing AND its neighbors.
2. **Verify after writing** — lint → typecheck → test; browser exercise for UI.
3. **One change, one verification.**
4. **Preserve contracts under test** — break one, update its test in the same
   commit with a rationale.
5. **No generated file goes unreviewed** — `bunx prisma generate`, never
   hand-edit `node_modules/.prisma`.

## Appendix B: Quick Reference Card

| Need | File |
|------|------|
| Commands & gotchas | `AGENTS.md` |
| Conventions & quality bar | `CLAUDE.md` |
| Architecture, ADRs, parity ledger | `Project_Architecture_Document.md` |
| Tailwind v4 contract | `docs/Tailwind-V4-Validation-Report.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| SSH git push | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` + `docs/ssh_git_wrapper_v3.py` |
| Session histories | `docs/session_1.md`, `docs/session_2.md`, `worklog.md` |
| Speed-line specs | `src/lib/speed-lines.ts` (+ `.test.ts`) |
| Category list | `src/lib/shop-categories.ts` (+ `.test.ts`) |
| DB resolution contract | `src/lib/db-path.ts` + `tests/db-path.test.ts` |
| Auth | `src/lib/auth.ts` |
| Serializers (DTO boundary) | `src/lib/serialize.ts` |
| Mobile menu | `src/components/layout/header.tsx` (ADR-007 pattern) |
| Home parity e2e | `tests/e2e/home.spec.ts` |
| Screenshots | `docs/screenshots/` |

**Demo identity:** `demo@fitpro.app` / `Demo1234!`
