# 011 — Speed up a project's diagram while its card is hovered

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW (missed opportunity, additive)
- **Category**: Missed opportunities
- **Estimated scope**: 3 files, ~25 lines
- **Depends on**: 001

## Problem

Each project card (`src/components/Projects.jsx`) shows an `AsciiFlow` diagram whose packets always run at the same speed. Hovering the card, the moment the visitor shows interest, changes nothing in the diagram.

## Target

- While the card is hovered (fine pointer only), packets run at 2x: `FLOW_RATE * 2` cells per second, painted at `FLOW_RATE * 2` fps so the motion stays one cell per frame.
- Speed changes keep each packet's position continuous: accumulate a virtual clock (`clock += dt * speed`) instead of computing `t` from a start time, so the packets never jump when the speed changes.
- Reduced motion: unchanged (still drawing).

```js
// AsciiFlow — virtual clock sketch
let clock = 0;
let prev = null;
function loop(now) {
  rafId = requestAnimationFrame(loop);
  const rate = fastRef.current ? 2 : 1;
  if (!visible || document.hidden || now - last < 1000 / (FLOW_RATE * rate)) return;
  if (prev !== null) clock += ((now - prev) / 1000) * rate;
  prev = now;
  last = now;
  paint(clock);
}
```

## Steps

1. In `AsciiFlow.jsx`, add an optional `fast` boolean prop, mirror it into `fastRef`, and switch the loop to the virtual clock above (`paint` receives seconds of virtual time).
2. In `Projects.jsx`, keep `hovered` per card (state or ref). Set it on `pointerenter`/`pointerleave` of `.project-inner`, only when `matchMedia('(hover: hover) and (pointer: fine)').matches`. Pass `fast={hovered}`.
3. Add a unit test in `src/components/stages.test.jsx`: with `fast`, the head advances twice as many cells over the same mocked time.

## Boundaries

- Do NOT change the card's own hover styles or the sticky stack.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: hover a card: packets visibly speed up with no jump; leave: they slow down from where they are. Frame by frame, each packet still moves one cell per changed frame.
- **Done when**: speed-ups are seamless and touch devices are unaffected.
