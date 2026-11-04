# 009 — Send a packet down the hovered contact wire

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW (missed opportunity, additive)
- **Category**: Missed opportunities
- **Estimated scope**: 4 files, ~50 lines
- **Depends on**: 001 (one cell per frame) and 008 (one wire per row)

## Problem

The contact section (`src/components/Footer.jsx`) is a wiring diagram whose packets run on their own. Hovering or focusing a channel link does nothing to the wire that leads to it, so the diagram does not respond to the visitor's intent.

## Target

When a channel link is hovered (fine pointer) or focused, one bright packet leaves `[ you ]`, runs down the vertical connector to that channel's row and along its arm to the link. Total travel time comes from the distance at `FLOW_RATE` (10 cells per second, one cell per frame). Ambient packets keep running. Reduced motion: no burst.

API:

```js
// src/lib/flow.js — add
/** Cells of a one-off packet that follows `path` (array of {x, y}) starting at t0. */
export function burstCells(path, t, t0) { /* head at index floor((t - t0) * FLOW_RATE), trail of 2 behind; [] once past the end */ }
```

```js
// src/lib/routes.js — add
/** The cells from the junction on row 0 down to row 2i, then along that arm. */
export function routePath(lines, index) { /* uses the '+' column and the arm's '-' run on row 2 * index */ }
```

`AsciiFlow` gets an optional `bursts` prop: an array of `{ path, t0 }`. Inside `flowFrame`, burst cells are drawn on the head layer after the ambient packets.

## Repo conventions to follow

- Pure maths in `src/lib` with tests (exemplar: `src/lib/flow.test.js`).
- Hover is gated to fine pointers in CSS; for JS, listen to `pointerenter` only when `matchMedia('(hover: hover) and (pointer: fine)').matches`, and always to `focus`.
- Keyboard focus may trigger the burst because it does not delay any action. The link itself never waits on the animation.

## Steps

1. Add `burstCells` to `flow.js` and `routePath` to `routes.js`, with unit tests: the path starts at the junction, ends at the arm's last dash, and is contiguous.
2. Extend `flowFrame(lines, wires, t, bursts = [])` to paint burst cells (head `*` on the head layer, trail on the trail layer).
3. In `AsciiFlow`, accept `bursts` and pass them to `flowFrame`; when `bursts` changes, make sure the loop is running (it already runs while visible).
4. In `Footer.jsx`, keep `const [bursts, setBursts] = useState([])`. On a link's `pointerenter` (fine pointer) or `focus`, push `{ path: routePath(ROUTES, i), t0: <AsciiFlow clock> }`. Expose the clock by having `AsciiFlow` accept an `onClock` ref or by passing `performance.now()` and converting it inside `AsciiFlow` with its own `start`. Drop bursts older than 3 s.
5. Skip all of this when `useReducedMotion()` is true.

## Boundaries

- Do NOT delay navigation or focus.
- Do NOT change the layout of the contact section.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: hover "github": a packet leaves `[ you ]` within one frame and arrives at the github arm's end. Hover several links quickly: each gets its own packet, with no restarts or freezes. Tab through the links with the keyboard: each focus sends a packet and focus moves immediately.
- **Done when**: every channel responds and reduced motion shows no bursts.
