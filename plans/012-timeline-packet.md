# 012 — Send a packet down the experience rail to each milestone it reaches

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW (missed opportunity, additive)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files, ~25 lines

## Problem

The experience timeline (`src/components/Experience.jsx:21-35`) fills its rail with `scaleY(progress)` and toggles `data-passed` on each item as the line reaches it. Reaching a milestone has no moment of its own, and the rail does not speak the packet language used everywhere else on the page.

## Target

- One `.exp-packet` element on the rail: a single core-coloured `*` (same colours as `.ascii-flow-head`: `color: var(--neb-core); text-shadow: 0 0 6px var(--neb-glow);`).
- It sits at the tip of the progress line: in `update`, set `packet.style.transform = translateY(<reach - rail top>px)` in the same write phase as the progress transform. Write the transform directly; no React state.
- When an item becomes newly passed, play a one-off brightening on that item's `.exp-node` using a CSS class swap with `@starting-style`-free keyframes: `node-ping 360ms cubic-bezier(.16, 1, .3, 1)` from `box-shadow: 0 0 0 0 var(--neb-glow)` to `box-shadow: 0 0 0 8px transparent`. It plays only on the passed transition, not on every scroll frame.
- Reduced motion: no packet element and no ping; the existing fill stays.

## Repo conventions to follow

- Read-then-write in `update` (`src/components/Experience.jsx:21`).
- Easing: `--ease` (`cubic-bezier(.16, 1, .3, 1)`).

## Steps

1. In `Experience.jsx`, add `<span className="exp-packet" ref={packetRef} aria-hidden="true">*</span>` inside `.exp-rail`.
2. In `update`, after computing `reach`, write `packetRef.current.style.transform = \`translateY(${reach - rect.top}px)\``. Track the previous passed set in a ref; for each item whose `data-passed` flips from false to true, add class `is-ping` to its `.exp-node` and remove it on `animationend`.
3. In `global.css`: `.exp-packet { position: absolute; left: 50%; top: 0; translate: -50% -50%; color: var(--neb-core); text-shadow: 0 0 6px var(--neb-glow); line-height: 1; }`, the `node-ping` keyframes, and hide `.exp-packet` and disable `.is-ping` under `prefers-reduced-motion: reduce`.

## Boundaries

- Do NOT change the accordion.
- Do NOT add a scroll listener: reuse the existing `useScrollLinked` update.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: scroll through Experience. The `*` rides the tip of the line; each milestone pings once as the line reaches it, and does not ping again on small back-and-forth scrolls around the same point (scroll back above it and down again: one ping per crossing is fine).
- **Done when**: the rail reads as a wire carrying light, and reduced motion shows only the fill.
