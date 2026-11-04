# Session: 2026-11-04

**Started:** 2026-11-03 ~11:30 (UTC, container clock)
**Last Updated:** 2026-11-04 01:45
**Project:** MarioFengW/MarioFengW.github.io (Gatsby 5 portfolio, deployed to GitHub Pages at https://mariofengw.github.io)
**Topic:** Full ASCII/terminal redesign of Mario Feng Wu's portfolio, then motion, transitions, theme switch and design review with impeccable + Emil skills

---

## What We Are Building

A personal portfolio for Mario Feng Wu (CS student, AI/ML + full-stack + cloud), built with Gatsby 5 + React 18, deployed by GitHub Actions to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml` runs `npm ci`, `npm test`, `npm run build`). The user (Spanish-speaking; reply in Spanish) asked for a critique and a redesign with an ASCII-animation visual direction, then iterated over 5 PRs.

The current site is a dark/light terminal world: monospace (self-hosted JetBrains Mono via @fontsource) with the Pixelta pixel font for display headings, an animated ASCII **nebula** hero (4 coloured glyph layers + stars, pointer swirl), a **boot screen** on every load (terminal log + ASCII dissolve), the live **Taipei weather as a full-bleed ASCII backdrop** of the About section (Open-Meteo, no geolocation), **scroll-linked ASCII divider bands** between sections, an **ASCII page-wipe** for in-page nav links, a **black/white theme switch** (View Transition wipe), an **experience timeline** whose rail fills on scroll, and **projects as a sticky stack** where covered cards recede.

All work lives on branch `claude/epic-ritchie-a4amq8`. PRs #1–#5 are ALL merged into `main` (latest main = 560ede2 "Merge pull request #5"); the branch has no unmerged commits.

---

## What WORKED (with evidence)

- **Test suite: 149 tests, 9 files, 100% line coverage** — confirmed by: `npx vitest run` → 149 passed; `npx vitest run --coverage` → All files 100% lines (≈98.8% branches). Coverage thresholds 80/80/75/80 in `vitest.config.mjs`.
- **Production build** — confirmed by: `npm run build` exit 0, and Gatsby error #11329 count = 0 (it was present since PR #2 and fixed in PR #4).
- **Theme switch** — confirmed in headless Chromium: OS dark → `data-theme=dark` already at DOMContentLoaded (no flash); OS light → light; pointer click uses View Transition; choice persisted to localStorage and survives reload; meta theme-color updated; Enter toggles instantly.
- **Experience timeline** — confirmed in Chromium: progress scaleY 0.00 → 0.40 → 1.00 while scrolling, milestones passed 0 → 1 → 3.
- **CSS accordion (grid-rows 0fr→1fr)** — confirmed: panel heights animate (e.g. 25px → 150px at 80ms → 175px settled); closed panels have `inert`.
- **Projects sticky stack depth** — confirmed: covered cards scale 1 → ~0.94 with scroll; last card never shrinks; reduced motion leaves a flat stack.
- **Nebula perf** — ~4ms/frame at 185x60 cells in Node; no long tasks (>50ms) observed in Chromium.
- **Boot screen** — appears from first paint (SSR), dissolves at ~1.2–1.6s, skippable (click/key), skipped under reduced motion, hidden without JS (`<noscript>` style), CSS fail-safe hides it after 4s.
- **Reduced motion / no-JS / mobile 390px** — confirmed: no horizontal overflow desktop+mobile; no-JS shows all content (only decorative `.project-shade` is opacity 0); console clean except sandbox-blocked Open-Meteo.
- **Bundle** — page chunk 54 KB → 12.3 KB gzip after removing the `motion` library (total JS ≈77 KB gzip).
- **Skills installed into the repo** (`.claude/skills/`, 17 skills + `skills-lock.json`): Emil Kowalski's set via `npx skills add emilkowalski/skill`, and `impeccable` via `npx skills add https://github.com/pbakaus/impeccable`. They became invocable mid-session (`Skill` tool listed `impeccable`, `emil-design-eng`, etc.).

---

## What Did NOT Work (and why)

- **Viewing the live site / its console from the sandbox** — `mariofengw.github.io` and the Actions artifact blob host are blocked by the environment network policy (proxy 403). chrome-devtools MCP also can't start (no X server, runs as root). Workaround used: rebuild identical commit locally and test with Playwright (`require('playwright')`, pre-installed Chromium).
- **Open-Meteo API from the sandbox** — blocked (ERR_TUNNEL_CONNECTION_FAILED). Verified weather visuals by intercepting with `page.route('**/api.open-meteo.com/**', ...)` and mock JSON.
- **`npx impeccable install`** — failed: its bundle host `impeccable.style` is blocked by the proxy ("Proxy failed to connect"). Workaround: install from GitHub with `npx skills add`.
- **Running impeccable's launcher (`scripts/impeccable context`)** — denied by the auto-mode classifier ("Code from External"; it downloads a binary from GitHub releases). Used the skill's documented "launcher unavailable" path instead. Do not retry without user permission.
- **`git push --force-with-lease` / `git checkout -B` to reset the branch after a PR merge** — denied by the auto-mode classifier (Git Destructive). Use instead: `git merge --ff-only origin/main` (the merged main always descends from the branch), then commit and push normally.
- **First push (PR #1 era)** — 403 until the user connected GitHub (claude.ai/connect-github). Now works.
- **Lazy-loading motion features (`LazyMotion features={() => import(...)}`)** — gave no saving in Gatsby (page is already an async chunk sharing the `motion/react` barrel). Moot now: `motion` was removed entirely.
- **`animation:` shorthand with `animation-timeline: view()`** — Gatsby's CSS minifier reordered properties so the shorthand reset the timeline to `auto`; animation ran as a 0s one and stuck at opacity 0. Fix: longhands only (regression test reads global.css). Also `.hero` must be `overflow: clip` (not hidden) or `view()` tracks the hero instead of the page.
- **Fully clipped element (`clip-path: inset(0 0 100% 0)`) as the IntersectionObserver target** — reported 0x0 intersection and never fired on narrow screens (also the `-80px` rootMargin shrank sides). Lesson: never observe a clipped element; use vertical-only margins.
- **`export const` of a non-API constant in `gatsby-ssr.js`** — Gatsby error #11329 (build still passed). Keep helpers module-private there.
- **Gatsby incremental build served stale CSS** once after a small global.css edit — fix: `npx gatsby clean` before verifying. CI is unaffected (clean builds).
- **Pixelta font lacks `'` and `"$\^{|}~`** — headings with apostrophes rendered with fallback glyphs; display copy is kept apostrophe-free ("Hello, world", "Get in touch"); scramble glyph pool restricted accordingly.
- **Testing gotchas:** mocking `getComputedStyle` with an object spread drops getters (`opacity`) and methods — use a Proxy; `fireEvent.click` has `detail: 0`, which the app now treats as keyboard activation — pass `{ detail: 1 }` for pointer clicks.

---

## What Has NOT Been Tried Yet

- Verify everything on the real deployed site (needs `mariofengw.github.io` and `api.open-meteo.com` in the environment's allowed domains, or the user checking manually).
- Running impeccable's launcher / design detector hook (needs user approval; `impeccable.style` also blocked).
- A `PRODUCT.md` / `DESIGN.md` for impeccable (`$impeccable init`, `$impeccable document`) so future design passes have durable context.
- An OG/social preview image (only text OG tags exist).
- Real device testing (iOS Safari for View Transitions fallback, sticky stack, touch).
- Re-reviewing animations "the next day" per Emil (slow-motion inspection in DevTools).

---

## Current State of Files

| File | Status | Notes |
| --- | --- | --- |
| `src/pages/index.jsx` | PASS: Complete | Page composition, `Head` (SEO/OG/favicon), BootScreen, PageTransition, SectionDividers |
| `src/components/Hero.jsx` | PASS: Complete | Visible by default; nebula `AsciiField` + pause/play button |
| `src/components/AsciiField.jsx` | PASS: Complete | 4-layer nebula via `useAsciiLoop` |
| `src/components/About.jsx`, `WeatherBackdrop.jsx`, `WeatherStatus.jsx` | PASS: Complete | Live Taipei weather backdrop + status panel |
| `src/components/Expertise.jsx` | PASS: Complete | Rows (no equal cards) |
| `src/components/Experience.jsx` | PASS: Complete | Scroll-filled timeline, CSS accordion, metrics |
| `src/components/Projects.jsx` | PASS: Complete | Sticky stack with depth, labelled CTA (`ctaLabel`) |
| `src/components/Header.jsx`, `ThemeToggle.jsx`, `ScrollMeter.jsx` | PASS: Complete | Nav (scroll-spy aria-current), theme switch, ASCII scroll meter |
| `src/components/PageTransition.jsx`, `SectionDivider.jsx`, `BootScreen.jsx`, `ScrambleText.jsx`, `SectionHeading.jsx`, `Footer.jsx`, `SocialLinks.jsx` | PASS: Complete | |
| `src/hooks/useAsciiLoop.js`, `useScrollLinked.js`, `useWeather.js`, `useReducedMotion.js` | PASS: Complete | |
| `src/lib/ascii.js`, `nebula.js`, `weatherField.js`, `weather.js`, `scrollMath.js`, `theme.js`, `motion-tokens.js` | PASS: Complete | Pure, unit-tested logic |
| `src/data/content.js` | PASS: Complete | All copy; `metric` fields must appear in their own description (tested) |
| `src/styles/global.css` | PASS: Complete | Dark + light tokens, hover gated to fine pointers, reduced-motion rules |
| `gatsby-ssr.js`, `gatsby-browser.js` | PASS: Complete | Theme head script, noscript boot hide, fonts |
| `src/**/*.test.js(x)`, `src/test/setup.js`, `src/test/browser.js`, `vitest.config.mjs` | PASS: Complete | 149 tests |
| `.claude/skills/*`, `skills-lock.json` | PASS: Complete | 16 Emil skills + impeccable (launcher not run) |
| `README.md` | PASS: Complete | Documents architecture and design decisions |

Removed this session (intentionally): `Counter.jsx`, `Highlights.jsx`, `MotionProvider.jsx`, `Reveal.jsx`, `AsciiWeather.jsx`, `test/render.jsx`, the `motion` dependency, old components (CometRain, WeatherCards, CursorFollower, …), PNG social icons, `package-lock copy.json`.

---

## Decisions Made

- **ASCII/terminal world, monospace everywhere** — reason: user's brief ("diseño de animación ASCII"); impeccable's "brief wins".
- **No animation library** — reason: CSS + View Transitions + small rAF loops cover everything; removing `motion` cut ~42 KB gzip.
- **Content visible by default; the boot dissolve is the one entrance moment** — reason: impeccable craft floor (no script-dependent hiding, one authored moment, not identical entrances per section).
- **No eyebrows/kickers above headings, no section numbers, no hero-metric stats band, no equal-card grids, no hard offset shadows** — reason: impeccable craft floor bans/refusals. Metrics live on their own entries.
- **Scroll-linked effects must carry meaning** (timeline progress, project stack, dividers between sections, hero exit) — reason: impeccable animate guidance.
- **Emil rules:** never animate keyboard-initiated actions (`event.detail === 0` → instant), hover only on `(hover: hover) and (pointer: fine)`, no `ease-in`, press feedback scale(.97).
- **Theme:** dark default, follows OS when unset, inline head script avoids flash; light = warm paper `#f4f2ec`; all text ≥4.5:1 in both themes.
- **Reduced motion = reduce, not remove:** nebula starts paused but playable; boot skipped; page wipe/section jumps instant; opacity/colour feedback kept.
- **Weather uses fixed Taipei coordinates** — reason: no geolocation permission prompt.
- **Skills installed at project scope and committed** — reason: cloud containers are ephemeral; `~/.claude` does not persist.
- **Branch workflow after a PR merges:** fast-forward the same branch to `origin/main`, then commit/push (force-push is blocked).

---

## Blockers & Open Questions

- Sandbox cannot reach `mariofengw.github.io`, `api.open-meteo.com`, `impeccable.style` (network policy). User can add them under the environment's Allowed domains.
- Does the user want back any effect removed during the impeccable review (animated counters, `whoami` typewriter, per-heading scanline)? Asked implicitly in the last summary; no answer yet.
- The user previously said the ASCII animation "didn't work" live; best hypothesis was OS reduced-motion (now there's a visible play button). Not confirmed on their machine.

---

## Exact Next Step

Everything is merged and deployed via PR #5. On resume: `git fetch origin && git merge --ff-only origin/main` on `claude/epic-ritchie-a4amq8`, run `npm ci && npm test && npx gatsby clean && npm run build`, then ask the user for feedback on the live site (theme switch, project stack, timeline) and whether any removed effect should return. If they want more design work, start with `$impeccable init` to create PRODUCT.md/DESIGN.md.

---

## Environment & Setup Notes

- Node 22 locally (CI uses Node 20). Commands: `npm ci`, `npm test` (Vitest + Testing Library, jsdom), `npm run test:coverage`, `npm run build`, `npx gatsby clean`.
- Browser verification: Playwright is pre-installed (`require('playwright')`, `chromium.launch()`); serve `public/` with a tiny Node http server; mock Open-Meteo with `page.route`. Playwright defaults to `colorScheme: 'light'` — set it explicitly when checking themes.
- Repo hooks (ECC GateGuard) require stating importers/purpose/user instruction before first edit of each file and before destructive commands; retrying after stating facts works.
- PR rules: use GitHub MCP tools (no `gh` except search); end PR bodies with the Claude Code attribution; do not create PRs unless asked.
