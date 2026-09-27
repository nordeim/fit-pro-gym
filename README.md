# FitPro GYM App — Premium Gym Membership & Store Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)
![Playwright](https://img.shields.io/badge/Tests-Playwright-2ead33?logo=playwright)
![Vitest](https://img.shields.io/badge/Unit-Vitest-6e9f18?logo=vitest)

A production-grade, self-hosted gym membership and e-commerce platform — a faithful, fully-functioning clone of the [FitPro GYM App reference](https://fit-pro-gym-app-c6cbb3a3.base44.app/), rebuilt as a single Next.js application with cookie-session auth, a membership plan catalog, a premium fitness store, a server-truth shopping cart, and a full checkout order flow.

## Overview

FitPro GYM App is the digital front desk of a premium gym: it markets the brand (animated hero with neon speed lines), sells **membership plans** (Starter → Family Pack), cross-sells **fitness gear and supplements** from an in-app store, and closes the loop with a **cart → shipping address → order** checkout. The reference is a base44 SPA backed by per-user entities (`Product`, `Membership`, `CartItem`, `Order`); this clone reproduces the same domain model and UX with a Next.js App Router architecture — server-rendered catalog pages, typed JSON API routes, and a Prisma/SQLite store that stays the single source of truth. The mobile navigation is a state-driven collapsible menu (never the `hidden` HTML attribute — a Tailwind v4 contract), the header badge reflects the live cart count, and every mutation lands with the reference's exact toast copy.

## Key Features

| Feature | Description |
|---------|-------------|
| 🏠 **Animated landing page** | Hero with six framer-motion neon "speed lines" (cyan/blue/yellow/green/teal gradients at staggered offsets), gradient "Ultimate" headline, tri-color stats (5000+ / 24/7 / 50+), gradient-framed hero image with glow blobs, "Why Choose" spotlight stat cards, plan preview with the popular plan pinned center, hover-reveal shop cards, and the closing CTA band |
| 💳 **Membership plans** | Four seeded tiers (Starter $29, Basic Fit $39, Pro Athlete $59 — *Most Popular*, Family Pack $149) with per-tier color schemes (blue/green/purple/orange gradients), a horizontally-scrolling plan rail sorted by price, and feature checklists |
| 🛒 **Premium fitness store** | Product grid with category badges, live search, category filter, and 3-way sort (name / price ↑ / price ↓); round blue add-to-cart buttons with optimistic disabled states |
| 🧺 **Server-truth cart** | Per-user cart lines with quantity steppers (minus disabled at 1), item-type badges, image-fallback initial tiles, live order summary (subtotal / free shipping / total), and the reference's app-level dedupe — re-adding an existing line bumps quantity with distinct toast copy |
| ✨ **Cross-sell dialog** | Choosing a membership opens "Complete Your Setup" — featured products with one-tap add, "No, Thanks", "Go to Cart", and "Explore Full Store" actions |
| 📦 **Checkout & orders** | Shipping-address form (street / city / state / ZIP, submit disabled until complete), order placement re-verified server-side against DB prices in a transaction, cart cleared atomically, success toast, and redirect home |
| 🔐 **Cookie-session auth** | scrypt password hashing + HMAC-signed sessions, per-IP login rate limiting (10 fails / 15 min → 429 with `Retry-After`), login + signup routes, authenticated `/login` redirects — zero external auth dependencies |
| 📱 **Reference mobile chrome** | Sticky blur header (h-16) with logo, cart badge, hamburger; the collapsible mobile menu renders from React state with `aria-expanded`/`aria-controls`, closes on route change (React's render-time adjustment pattern), and swaps the user cluster for Login when logged out |
| 🎨 **Dark premium design system** | gray-900 canvas, glass cards (`bg-white/5` + backdrop-blur), the reference's exact brand tokens (`--gym-primary: #0ea5e9`, `--gym-secondary: #10b981`), and the reference's toast palette (green/red/blue at 20% alpha) |
| 🧪 **Battle-tested** | 25 Vitest unit tests (db-path resolution contract, float-safe money math, serializers) + 29 Playwright e2e specs across auth, mobile navigation, shop, memberships, and cart — all green |

## Screenshots

| Home (desktop) | Memberships (desktop) |
|---|---|
| ![Home](docs/screenshots/home-desktop.png) | ![Memberships](docs/screenshots/memberships-desktop.png) |

| Shop (desktop) | Cart + Checkout (desktop) |
|---|---|
| ![Shop](docs/screenshots/shop-desktop.png) | ![Cart](docs/screenshots/cart-desktop.png) |

| Mobile home | Mobile menu open |
|---|---|
| ![Mobile home](docs/screenshots/home-mobile.png) | ![Mobile menu](docs/screenshots/mobile-menu-open.png) |

| Login | Shop (mobile) |
|---|---|
| ![Login](docs/screenshots/login-desktop.png) | ![Shop mobile](docs/screenshots/shop-mobile.png) |

## Architecture

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router, Turbopack, standalone output) | 16.3 | SSR catalog pages + API routes in one deployable |
| UI runtime | React | 19.3 | Server Components by default, client islands for interactivity |
| Language | TypeScript (strict) | 5.9 | End-to-end types across routes, DTOs, and tests |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) + PostCSS | 4.3 | Tokens in `src/app/globals.css` — no `tailwind.config.*` (see `docs/Tailwind-V4-Validation-Report.md`) |
| Components | Radix primitives, shadcn-style (`src/components/ui`) | current | Accessible Select/Dialog/Label primitives themed via CSS vars |
| Animation | Framer Motion | 13.4 | Hero speed lines, card entrances/hovers, view transitions — `prefers-reduced-motion` aware |
| Database | SQLite (file at `db/custom.db`) | — | Zero-config local dev; swap to PostgreSQL via `DATABASE_URL` + provider |
| ORM | Prisma | 6.19 | Typed schema, `db push` workflow, transactional checkout |
| Auth | Custom (scrypt + HMAC cookie) | — | No external dependency; rate-limited JSON endpoints |
| Unit tests | Vitest | 5.0 | Pure seams: db-path resolution, money math, serializers |
| E2E tests | Playwright | 1.63 | Production standalone server + isolated `db/e2e.db`, storageState auth |

```mermaid
flowchart TB
    subgraph Client
        H["Header / MobileNav (state-driven)"]
        P["Pages: / Home · /Memberships · /Shop · /Cart · /login"]
    end
    subgraph NextApp["Next.js App Router"]
        SSR["Server Components (catalog reads via Prisma)"]
        API["JSON API routes"]
    end
    subgraph Data
        DB[("SQLite · Prisma")]
    end
    P --> SSR --> DB
    P --> API --> DB
    H --> API
```

## File Hierarchy

```
fit-pro-gym/
├── 📂 prisma/                # schema.prisma (5 models), idempotent seed.ts
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📂 (app)/         # chrome layout: Header + Footer
│   │   │   ├── 📂 Home/      # landing (reference's main page)
│   │   │   ├── 📂 Memberships/
│   │   │   ├── 📂 Shop/
│   │   │   └── 📂 Cart/
│   │   ├── 📂 api/           # auth, products, memberships, cart, orders, health
│   │   ├── 📂 login/ · 📂 signup/   # auth pages (no app chrome)
│   │   ├── globals.css       # Tailwind v4 @theme + FitPro brand tokens
│   │   └── layout.tsx        # AppProvider + Toaster
│   ├── 📂 components/        # ui/ · layout/ · home/ · memberships/ · shop/ · cart/ · auth/
│   ├── 📂 lib/               # db-path.ts · db.ts · auth.ts · serialize.ts · utils.ts (+ .test.ts)
│   └── 📂 hooks/             # (reserved)
├── 📂 tests/
│   ├── 📂 e2e/               # Playwright: auth, mobile-navigation, shop, memberships, cart
│   └── db-path.test.ts       # the db-path resolution contract (15 specs)
├── 📂 docs/                  # screenshots/, DEPLOYMENT.md, Tailwind-V4-Validation-Report.md
└── 📂 skills/                # repo-local agent skills (unchanged from scaffold)
```

## Quick Start

Requires **Node.js ≥ 20** (or Bun ≥ 1.1) and a Prisma-compatible SQLite toolchain.

```bash
# 1. Install
bun install            # or: npm install

# 2. Create the database + demo data
bun run db:push        # prisma db push (creates db/custom.db)
bun run db:seed        # demo user, 4 plans, 8 products

# 3. Start dev
bun run dev            # http://localhost:3000
```

**Verify setup:**

```bash
curl http://localhost:3000/api/health
# {"status":"ok","app":"fit-pro-gym"}

# sign in as the demo user
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@fitpro.app","password":"Demo1234!"}'
# Set-Cookie: fitpro_session=... + {"user":{...}}
```

Open http://localhost:3000, sign in with `demo@fitpro.app` / `Demo1234!`, choose a membership plan, add gear from the Shop, and complete a checkout.

> **Note:** if your shell exports an absolute `DATABASE_URL` (some sandboxes do), prefix commands: `DATABASE_URL="file:../db/custom.db" bun run db:seed`.

## Environment Variables

Copy `.env.example` to `.env` and adjust:

```ini
# SQLite by default (zero-config local dev). Relative file: URLs resolve
# against prisma/schema.prisma (src/lib/db-path.ts pins the contract).
DATABASE_URL="file:../db/custom.db"
# PostgreSQL: set provider = "postgresql" in prisma/schema.prisma, then
# DATABASE_URL=postgresql://user:password@localhost:5432/fitpro

# Session signing secret for HMAC cookie auth.
# REQUIRED in production: generate with `openssl rand -hex 32`.
AUTH_SECRET=""

# Canonical public origin (metadata).
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing

```bash
bun run test          # Vitest — 25 unit specs (db-path, money, serializers)
bun run typecheck     # tsc --noEmit
bun run lint          # eslint .

# E2E (Playwright): builds the standalone server, boots it on :3100 with an
# isolated db/e2e.db, signs the demo user in once (storageState), 29 specs.
bun run build         # prerequisite: the standalone server must exist
bun run test:e2e
```

E2E notes: the auth endpoints are rate-limited (10 attempts/IP/15 min) — the suite signs in once via the `setup` project and replays the session cookie; `tests/e2e/auth.spec.ts` opts out to exercise the logged-out surface.

## API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | — | Liveness probe |
| `/api/auth/login` | POST | — | Sign in (sets session cookie; 401 / 429 on failure) |
| `/api/auth/register` | POST | — | Create account + session (409 on duplicate email) |
| `/api/auth/logout` | POST | — | Clear session |
| `/api/auth/me` | GET | — | Current user or `{user: null}` |
| `/api/products` | GET | — | Catalog (`?featured=true&limit=N`) |
| `/api/memberships` | GET | — | Plan catalog (features parsed to `string[]`) |
| `/api/cart` | GET | ✅ | The caller's cart lines |
| `/api/cart` | POST | ✅ | Add a line (dedupes by user+type+item → quantity bump) |
| `/api/cart/count` | GET | ✅ | Header badge total |
| `/api/cart/[id]` | PATCH | ✅ | Update quantity (owner-checked; ≥ 1) |
| `/api/cart/[id]` | DELETE | ✅ | Remove a line (owner-checked) |
| `/api/orders` | POST | ✅ | ⚠️ Checkout: snapshot cart → Order, clear cart, in a transaction |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--gym-primary` | `#0ea5e9` | Brand sky (accent utilities `gym-primary`) |
| `--gym-secondary` | `#10b981` | Brand emerald (accent utilities `gym-secondary`) |
| `--gym-dark` | `#1f2937` | Dark surface anchor |
| `--gym-accent` | `#f59e0b` | Amber highlight |
| Canvas | `bg-gray-900` | App background |
| Plan gradients | `from-blue-500 to-blue-600` · green · purple · orange | Tier color schemes |
| Toast palette | `bg-green-500/20` · `bg-red-500/20` · `bg-blue-500/20` | Success / error / info |

Typography: the system sans stack (`ui-sans-serif, system-ui, ...`) — same as the reference. Animation names: framer-motion variants (`speed lines`, card entrances, hover lifts) with a `prefers-reduced-motion` guard in `globals.css`.

## Tailwind v4 Notes

This repo is a CSS-first Tailwind v4 codebase (validated in `docs/Tailwind-V4-Validation-Report.md`):

- **No `tailwind.config.js/ts`** — every token lives in `src/app/globals.css` (`@theme inline`).
- **Automatic content detection** — no `content` array.
- **`hidden` attribute beats display utilities** — the mobile menu toggles via React state (conditional render), never the `hidden` attribute; see `src/components/layout/header.tsx`.
- **Symmetric breakpoints** — desktop nav `hidden md:flex` vs mobile trigger/menu `md:hidden`.
- `tw-animate-css` is vendored (`src/app/tw-animate-vendored.css`) because its package exports only expose a `style` condition Turbopack's CSS resolver can't resolve bare.

## Project Status

| Phase | Status | Key Deliverables |
|-------|--------|------------------|
| Recon & design extraction | ✅ Complete | Reference app audited (DOM, bundle, entity API, VLM) — exact tokens/markup captured |
| App implementation | ✅ Complete | 5 routes, 11 API endpoints, 5 Prisma models, seeded catalog |
| Mobile navigation hardening | ✅ Complete | State-driven menu + 8 e2e specs (aria, auto-close, touch targets) |
| Test suites | ✅ Complete | 25 unit + 29 e2e, all green; lint + typecheck clean |
| Documentation | ✅ Complete | README, AGENTS.md, CLAUDE.md, Project_Architecture_Document.md |

## License

Private clone for evaluation — no license granted. The reference app's brand assets belong to their respective owners.
