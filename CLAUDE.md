# CLAUDE.md — FitPro GYM App

Guidance for Claude Code when working in this repository. Read `AGENTS.md` for the compact command/gotcha reference; this file adds the conventions and quality bar.

## Project Context

**What:** A self-hosted clone of the FitPro GYM App (base44 reference): a gym marketing landing page, membership plan catalog, fitness store, per-user cart, and checkout order flow.

**Stack:** Next.js 16 (App Router, Turbopack, standalone output) · React 19 · TypeScript strict · Tailwind CSS v4 (CSS-first) · Radix/shadcn-style components · Framer Motion · Prisma 6 + SQLite · custom scrypt/HMAC cookie auth · Vitest + Playwright.

**Runtime:** Bun is the documented runtime (`bun run dev|build|start`, `bun prisma/seed.ts`); npm/npx fallbacks exist in scripts. Node ≥ 20 works for everything except the seed's `bun` shorthand (use `bunx tsx prisma/seed.ts`).

**Demo identity:** `demo@fitpro.app` / `Demo1234!` (seeded). Routes are capitalized for reference parity: `/Home`, `/Memberships`, `/Shop`, `/Cart`; `/` ≡ `/Home`; `/login` lowercase. The reference never built a signup page — `/signup` deliberately renders the branded 404 (HTTP 200, reference SPA behavior); `/api/auth/register` is the only signup path.

## The Meticulous Approach (workflow contract)

1. **Read before writing.** For any change, first read the file you're editing and its neighbors. Never blind-overwrite.
2. **Verify after writing.** After implementation: `bun run lint && bun run typecheck && bun run test`. For UI changes, also exercise the flow in a browser (agent-browser or Playwright) — unit tests do not cover components.
3. **One change, one verification.** Don't batch unrelated edits; verify after each logical unit so failures localize.
4. **Preserve contracts under test.** `tests/db-path.test.ts`, `src/lib/utils.test.ts`, and the e2e suite pin behavior. If a change requires breaking a pinned contract, update the test IN THE SAME COMMIT and explain why in the commit message.
5. **No generated file goes unreviewed.** Prisma client is generated (`bunx prisma generate`) — never hand-edit `node_modules/.prisma`.

## Code Conventions

### TypeScript / React

- **Strict mode is on; `noImplicitAny` off** (scaffold decision) — still annotate public boundaries (API route handlers, exported lib functions).
- **Server Components by default.** A file becomes `"use client"` only when it needs state/effects/motion. Data-fetching pages (`Home`, `Shop`) read Prisma directly server-side and pass DTOs to client islands.
- **No `forwardRef` wrappers** for DOM elements unless integrating with Radix — React 19 ref props suffice.
- **ESLint `react-hooks/set-state-in-effect` is enforced.** Closing the mobile menu on route change uses React's render-time adjustment pattern (compare tracked pathname, set state during render) — not an effect. Async fetch effects that call setState after `await` are the accepted external-sync pattern; targeted disables exist in `providers.tsx` with justification comments.
- **Full class strings in JSX** — Tailwind can't statically analyze dynamic class concatenation. Template-literal interpolation of complete class strings (the pattern used in cards/plan buttons) is fine; never construct class names from fragments.

### Tailwind CSS v4 (CSS-first)

- All design tokens live in `src/app/globals.css`: shadcn HSL vars, `@theme inline` mappings, and the FitPro brand tokens (`--gym-primary` etc. → `gym-primary` color utilities).
- **No `tailwind.config.js/ts`** — creating one regresses the repo (see `docs/Tailwind-V4-Validation-Report.md`).
- Mobile chrome rules: symmetric breakpoints (`hidden md:flex` / `md:hidden`), the menu is conditionally rendered from state — **the `hidden` HTML attribute must never toggle the mobile menu** (v4: attribute beats display utilities).
- `tw-animate-css` is vendored at `src/app/tw-animate-vendored.css` — import that, not the package.

### Data & API

- **Prisma is the only DB access.** Route handlers import `@/lib/db` (singleton with resolved SQLite URL). Never construct a second `PrismaClient`.
- **Serialization is centralized** in `src/lib/serialize.ts` — DB rows never reach the client raw; `features` JSON parsing happens ONLY there (`parseFeatures`).
- **Cart money math uses integer cents** (`cartTotal` in `src/lib/utils.ts`). Never reintroduce naive float `reduce(price * quantity)` — `0.1 + 0.2` corrupts orders; the unit suite pins this.
- **Server-side ownership checks on every cart/order mutation** (compare `userEmail` from the session, never a client-supplied email).
- **The add-to-cart dedupe is app-level** (filter → bump quantity → distinct message), mirroring the reference; the `@@unique([userEmail, itemType, itemId])` is defense in depth.
- **Checkout runs in a `prisma.$transaction`** — Order create + cart clear are atomic; totals are recomputed from DB rows, not client input.
- **Toast copy is reference parity** — the exact strings ("Product added to cart!", "Membership already in your cart!", "Quantity updated in cart!", "Item removed from cart", "Order placed successfully! You will receive a confirmation email shortly.") are part of the clone's contract. Don't paraphrase.

### Auth

- scrypt password hashing (`hashPassword`/`verifyPassword` in `src/lib/auth.ts`) — format `salt:hash` hex.
- Sessions are HMAC-SHA256 signed cookies (`fitpro_session`, base64url body + signature, 7-day expiry), `AUTH_SECRET` env (insecure dev fallback constant when unset — documented in `.env.example`).
- Login/register are rate-limited per IP (10 fails / 15 min). Keep total real login attempts in any test run well under that.
- `getSessionUser()` reads the cookie via `next/headers` — server components and route handlers only.
- **`/login` renders for authenticated visitors (no redirect) — reference parity.** Login failures surface a red shadcn-style `Alert` ("Invalid email or password") above the form; the login page title is the absolute "FitPro GYM App". The login card uses the reference's real 480×480 logo asset (`public/login-logo.png`).

### UI / UX parity

- The header, footer, hero, plan cards, product cards, cart rows, checkout form, login card, and branded 404 are **pixel-matched to the reference** (markup classes were extracted from the live app's DOM/bundle). Changes to these files should preserve the extracted classnames or have an explicit reason.
- framer-motion entrance/hover animations mirror the reference (staggered `delay: index * 0.1`, `whileHover: { y: -12 }`, 8 speed lines per hero with the exact durations/delays in `src/lib/speed-lines.ts`). `useReducedMotion` guards exist — keep them.
- Icons: **lucide-react pinned at exactly 0.475.0** (the reference's build version — 0.5xx redesigns ShoppingBag/Dumbbell/Menu/LogOut/Mail/Search/Users). Geometry is pinned by `tests/e2e/icons.spec.ts`. Icons matched 1:1 to the reference: Home=House, Memberships=CreditCard, Shop=ShoppingBag, cart=ShoppingCart, logo=Dumbbell, features=Check, popular=Star on the HOME plan card, popular=Crown on the MEMBERSHIPS rail card, why-choose stats=Users/Award/Zap/Star, memberships Choose buttons include a ShoppingCart.
- Fonts: the reference's `--font-sans` (`ui-sans-serif, system-ui, …` — Tailwind v4's early default) is pinned in `src/app/globals.css`; Tailwind ≥ 4.1 ships a different v3-style stack.
- Home plan preview mirrors the reference's bundle algorithm — `[newest, HARDCODED-Pro, second-newest]` over the three newest plans (`src/lib/home-featured-plan.ts`, unit-pinned; the hardcoded card carries five design features incl. "Premium equipment access", NOT the entity's six). Featured-product surfaces (home preview `take 4`, cross-sell `take 3`) run `featured:true + createdAt desc` with the seed's 200ms stagger pinning [Pre-Workout, Yoga Mat, Dumbbells, Whey].
- **The product catalog is the reference's real entity data — exactly 4 products** (all featured). The Shop grid's card bodies use the reference's `flex flex-col justify-between` (price rows pin to the card bottom), the Shop + home-preview grids are `gap-8`, the cross-sell dialog cards are `rounded-xl` with `transition-transform` images, the Shop empty state is the reference's single centered paragraph ("No products found matching your criteria."), and the memberships rail keeps the browser's native scrollbar — all e2e-pinned. The reference's injected "XSS-INJECT-TEST" junk row is deliberately not cloned.
- **The reference's stylesheet is compiled with Tailwind v3; the clone's is v4 — the clone pins the reference's COMPUTED geometry wherever the two emissions diverge.** Three pin families (all e2e-pinned): (1) line-height cascade — `md:text-6xl` + `leading-tight` renders lh 1 on the reference (v3 emits responsive text rules last) but 1.25 on v4, so the hero h1 carries `md:leading-none` and the lede `md:leading-[2rem]`; (2) `space-y` direction — v3's margin-top-on-following-sibling vs v4's margin-bottom-on-preceding (ignored on the inline login labels → explicit `mt-1.5` on the input wrappers); (3) placeholder cascade — the reference's Input base `placeholder:text-muted-foreground` wins its v3 cascade, so the clone passes it explicitly (rendering #737373). The speed lines are `absolute` (in-flow stacking inflates the heroes by 48px), buttons get `cursor:pointer` via a base rule, and the home "View All Plans" CTA is a solid blue default-size button — all reference contracts.
- Images: the reference's Unsplash URLs are part of the seed data. Use `<img>` (not next/image) for parity with the reference — the repo's ESLint does not flag it.

## Testing

- **Unit (Vitest):** pure seams only — `src/lib/*.test.ts` + `tests/db-path.test.ts` (47 specs: db-path, speed-lines, shop-categories, not-found-name, home-featured-plan, money, serializers). Run: `bun run test`.
- **E2E (Playwright):** `bun run build && bun run test:e2e`. Production standalone server on :3100 with isolated `db/e2e.db` (global-setup pushes + seeds). Spec files: `auth` (incl. the plain-label + field-gap geometry pins), `mobile-navigation`, `home` (reference-parity surfaces incl. the hardcoded preview card, featured order, hero 840px/absolute speed lines, the typography-cascade pins, and the solid-blue View All Plans CTA), `icons` (SVG path-geometry pins), `not-found`, `shop` (incl. card-geometry/gap/empty-state pins + hero typography + the untyped search input with its #737373 placeholder), `memberships`, `cart` (incl. checkout placeholder pins) — 74 specs total.
- **Always test through the API when arranging state** in specs (`page.request.get/post/delete`) — the UI flow is the thing under test.
- New e2e specs join the main project and inherit the authenticated storageState; only `auth.spec.ts` opts out.

## Commit Discipline

- Small, single-purpose commits; imperative subject lines ("Fix mobile menu close on route change", not "updates").
- Every commit leaves `lint`, `typecheck`, `test`, and (when UI/API touched) the relevant e2e spec green.
- Never commit: `.env`, `db/*.db`, `tests/e2e/.auth/`, `test-results/`, `dev.log` (all git-ignored — keep it that way).
- Pushes use the SSH wrapper documented in `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.

## Documentation Map

| Doc | Purpose |
|-----|---------|
| `README.md` | Product + architecture overview, quick start, API reference |
| `AGENTS.md` | Compact command/gotcha sheet for any coding agent |
| `Project_Architecture_Document.md` | Definitive engineering reference: ADRs, topology, schemas, security |
| `docs/Tailwind-V4-Validation-Report.md` | The v4 CSS-first contract this repo follows |
| `docs/DEPLOYMENT.md` | Production deployment guide |
| `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` | Git push via SSH wrapper |
| `docs/screenshots/` | Current UI captures |
