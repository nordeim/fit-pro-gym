# Session 7 — Reference-Parity Audit & Remediation (Completion Log)

**Session:** 7 · **Date:** 2026-09-27 · **Base:** `5b41815` (user's session-9 docs commit)
**Delivered as:** one commit on `main` ("fix: reference parity remediation (session 7)").
**Note on file naming:** `docs/session_8.md` (session-6 completion log) and
`docs/session_9.md` (the session-6 run transcript) were user-committed; this
completion log takes the next free number. `docs/prompt-to-review-3.md` is the
user's review prompt for this cycle (saved verbatim, key stripped — the repo's
convention since `prompt-to-review-2.md`).

## Scope

Refresh the workspace, re-review the root docs + `docs/session_8.md` /
`worklog.md` / `docs/session_9.md`, validate the codebase, then a fresh
full-cycle parity audit against the live reference — mobile navigation as the
first-class citizen (Tailwind v4 watch) — followed by TDD remediation,
screenshots, docs, and push to `main`.

## Audit results

### Mobile navigation — full behavioral parity (third consecutive verification)

Verified end-to-end on BOTH sites at 390×844: hamburger → X icon swap
(`lucide-menu w-5 h-5` ↔ `lucide-x`), menu structure
(`md:hidden border-t border-white/10 bg-gray-900/90 backdrop-blur-lg` +
`px-4 py-3 space-y-2`), links Home/Memberships/Shop with the active pill
(`bg-white/10 text-white`) following the route, the user section
(`lucide-user` + `text-sm text-white` + Logout), route-change auto-close, and
X-button close. **No Tailwind v4 bugs.** The clone's `aria-expanded` /
`aria-controls` remain deliberate a11y enhancements (the reference has
neither).

### Target data drift — none

Entity API ground truth: products (4 real + the injected XSS junk row, prices
34/79/299/49, all `created_date` 2025-07-01T14:15:08.553Z) and memberships
(two tie groups 2025-07-01 / 2025-07-30) are byte-identical to the session-6
capture. The reference's cart writes remain broken (POST 200, nothing
persists — base44-side regression, documented in PAD v1.4).

### Root findings (13 defects, all TDD-remediated) — the session's theme: **Tailwind v3 → v4 emission differences**

The decisive discovery: the reference's stylesheet is compiled with
**Tailwind v3** (literal rem values, `--tw-shadow` reset vars, responsive
variants emitted at the END, no `--tw-leading` mechanism, no `@theme`), while
the clone is v4. Five of the defects are direct consequences of that
version gap:

| ID | Defect | Evidence |
|----|--------|----------|
| S7-R1 | Home hero **h1 line-height 75px vs 60px** — v3 emits `md:text-6xl{line-height:1}` AFTER `.leading-tight{1.25}` so the size's own line-height wins; v4's `--tw-leading` mechanism reverses the precedence. The hero rendered 45px taller per headline. | computed styles + both stylesheets' rule order |
| S7-R2 | Home hero lede **line-height 39px vs 32px** (`md:text-2xl`'s 2rem vs `leading-relaxed`'s 1.625) — same mechanism. | computed styles both sides |
| S7-R3 | **Every button rendered `cursor:default`** — the reference's bundle carries a base rule `button,[role=button]{cursor:pointer}` (found in its live CSS); the v4-era shadcn components ship default. | `getComputedStyle(btn).cursor` on 10 buttons per site |
| S7-R4 | **Shop hero h1 rendered 36px vs 48px** — the clone was missing `md:text-5xl` (and `mb-4` vs the reference's `mb-6`). | DOM class extraction both sides |
| S7-R5 | **Shop hero lede** was `text-lg text-gray-400` instead of the reference's `text-xl text-gray-300 max-w-3xl mx-auto` (18px vs 20px, wrong gray, no measure/centering). | DOM extraction |
| S7-R6 | Shop hero wrapper margin `mb-8` vs the reference's `mb-12`. | DOM extraction |
| S7-R7 | **Login labels**: the clone's v4-shadcn Label base (`flex items-center gap-2 leading-none select-none…`) rendered 14px line-height; the reference's login shell uses PLAIN labels (`text-sm font-medium`, computed 20px). Its checkout form, conversely, uses the shadcn Label WITH `leading-none`. | live DOM + reference bundle (`Ca` = `text-sm font-medium leading-none peer-disabled:…`) |
| S7-R8 | **Placeholder colors**: the reference renders #737373 (muted-foreground) on the shop search and checkout inputs — its Input base's `placeholder:text-muted-foreground` is emitted AFTER `placeholder:text-gray-400`, winning the v3 cascade. The clone translated the page's `placeholder-gray-400` into an active `placeholder:text-gray-400` → #9ca3af. | rule positions in target-live.css + computed `::placeholder` |
| S7-R9 | The clone's search input was `type="search"`; the reference's carries no type attribute. | DOM |
| S7-R10 | **LATENT THEME BUG (worst find):** `@theme inline` mapped all 31 shadcn HSL-triplet vars WITHOUT the `hsl()` wrapper (`--color-muted-foreground: var(--muted-foreground)` → resolves to the invalid string "0 0% 45.1%"). Every shadcn color utility (`placeholder:text-muted-foreground`, `text-muted-foreground`, `border-input`, `bg-background`, …) silently fell back to currentColor. The reference's own CSS wraps correctly (`hsl(var(--muted-foreground))`). | generated CSS rules + computed values |
| S7-R11 | The home plans-preview **"View All Plans" CTA** was a gradient `size="lg"` pill (`text-lg`, px-8 py-4) — the reference renders a SOLID `bg-blue-600` default-size button (`text-sm font-semibold h-10 px-6 shadow`, ArrowRight w-4 h-4; 191×40px). | DOM extraction + button sweep |
| S7-R12 | **Speed lines were NOT absolutely positioned** — the reference's streak divs are `absolute top-[N%] h-N w-full …`; the clone's `SpeedLines` component omitted `absolute`, so the 8 lines stacked IN-FLOW, inflating BOTH hero sections by 48px (the sum of the line thicknesses) and pushing the hero content down. The bug had survived every prior session's text-level and VLM audits (framer-motion's x-transforms still animate static divs). | section children walk: target all `position:absolute` vs clone all `static`; hero 840 vs 888px |
| S7-R13 | **v4 `space-y` semantics vs inline labels**: v4 emits `margin-bottom` on the PRECEDING sibling (`> :not(:last-child)`), v3 emitted `margin-top` on the FOLLOWING one. On the login form the preceding sibling is an INLINE `<label>` — vertical margins on inline elements are ignored — so the clone's label→input gap collapsed (4px line-box overhang vs the reference's 6px), making the login card 12px shorter (734 vs 746). | margin computed styles + per-group geometry walk |

Also fixed a latent **e2e race** (not an app defect): the session-6
card-geometry spec read the card and price-row boxes with two sequential
`locator.boundingBox()` calls that could straddle the framer-motion entrance
animation (card mid-flight at y:20, row settled), inflating the measured gap
to 19–20px. Now measured atomically inside one `evaluate()` — settled
geometry is 16px + subpixel rounding on every card, and the spec is stable.

## Remediation (TDD — specs first)

1. **RED:** 10 new e2e specs written before any fix — hero h1/lede computed
   line-heights (60px/32px), all-buttons pointer cursor, hero section height
   840px + every speed line `position:absolute`, the "View All Plans" CTA
   anatomy (solid blue, h-10/px-6/text-sm 14px, icon w-4 h-4, height 40),
   shop hero typography (md:text-5xl 48px, text-xl 20px, mb-12 wrapper),
   untyped search input + #737373 placeholder, checkout placeholder colors,
   login labels (plain, 20px line-height, no leading-none) and the 6px
   label→input gap. All 6 initially-failing specs failed for exactly the
   audited reasons.
2. **GREEN:**
   - `hero.tsx`: `md:leading-none` (h1) + `md:leading-[2rem]` (lede) — the v3
     cascade pinned explicitly.
   - `shop-page.tsx`: reference-exact hero classes (`text-4xl md:text-5xl
     font-bold text-white mb-6`, `text-xl text-gray-300 max-w-3xl mx-auto`,
     `text-center mb-12`), search input de-typed, placeholder →
     `placeholder:text-muted-foreground`.
   - `cart-page.tsx`: the 4 checkout inputs' placeholders →
     `placeholder:text-muted-foreground`.
   - `globals.css`: base-layer rule `button, [role="button"] { cursor: pointer }`
     and the **hsl() wrappers on all 31 shadcn color mappings** (S7-R10).
   - `ui/label.tsx`: base → the reference's v3-shadcn Label
     (`text-sm font-medium leading-none peer-disabled:cursor-not-allowed
     peer-disabled:opacity-70`).
   - `auth-form.tsx`: plain `<label>` elements matching the reference's login
     markup verbatim + `mt-1.5` on the input wrappers (the v3 space-y gap).
   - `plans-preview.tsx`: the solid blue default-size CTA.
   - `ui/speed-lines.tsx`: `"absolute"` restored to the streak class assembly.
3. **Gates:** lint ✓ · typecheck ✓ · unit 47/47 ✓ · build ✓ · e2e **74/74**
   (64 → 74; card-geometry spec hardened to the atomic measurement).
4. **Visual verification:** live re-measurement — Home hero 840px =
   reference exactly (stats bottom 719 = 719), Memberships hero 424px =
   reference, login card 746px = reference (field group 78px), shop h1 48px,
   placeholder #737373, all buttons pointer; computed-style sweep over
   Home/Shop/Memberships/Cart/login: **zero property-level differences**
   (modulo the documented junk-row exclusion); VLM side-by-sides: Home MATCH
   (only the dev-mode tools badge), Shop MATCH (only the excluded
   XSS-INJECT-TEST card), **Login MATCH (verbatim)**.
5. **Screenshots:** all 12 captures re-taken under `docs/screenshots/`
   (desktop + mobile for Home/Memberships/Shop/Cart, mobile-menu-open,
   login, cross-sell dialog, signup-404; populated 3-line cart; stepped-scroll
   settling for the animated full-page shots).
6. **Docs:** prompt-to-review-3.md saved; README (counts + features),
   AGENTS.md (counts + 5 new gotchas), CLAUDE.md (parity facts + counts),
   PAD v1.5 (revision block + parity ledger rows), SKILL v1.5.0 (v3-emission
   section + new debug rows), this log, worklog.

## Verification summary

| Gate | Result |
|------|--------|
| `bun run lint` | clean |
| `bun run typecheck` | clean |
| `bun run test` | 47/47 |
| `bun run build` | standalone OK |
| `bun run test:e2e` | 74/74 |
| Home hero vs reference | 840px section, 60px/32px line-heights, stats bottom 719px — exact |
| Memberships hero vs reference | 424px — exact |
| Login card vs reference | 746px, labels 20px lh, 6px gaps — exact |
| Shop hero vs reference | 48px h1, 20px lede, mb-12 — exact |
| Placeholders vs reference | #737373 on search + checkout inputs — exact |
| Buttons vs reference | pointer cursor on both sites |
| Mobile menu vs reference | identical behavior (open/close/aria/route-change/active) — third consecutive verification, no Tailwind v4 bugs |
| VLM Home / Shop / Login | MATCH / MATCH (excluded junk row) / MATCH |
