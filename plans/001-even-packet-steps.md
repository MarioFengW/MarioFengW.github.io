# 001 — Make wire packets advance exactly one cell per frame

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: HIGH
- **Category**: Easing & duration (constant motion)
- **Estimated scope**: 3 files, ~6 lines

## Problem

Packets move at 9 cells per second but frames are painted at 12 fps, so each frame advances 0.75 cells. `wireCells` floors the position, so on some frames the packet does not move and on others it jumps: visible judder on every animated diagram, the expertise pipeline, the contact wires and the footer journey.

```js
// src/lib/flow.js:4 — current
const SPEED = 9; // cells per second
```

```js
// src/components/AsciiFlow.jsx:5 — current
const FPS = 12;
```

Constant motion must be linear and even: one cell per painted frame.

## Target

Speed and frame rate share one constant, so a packet moves exactly one cell per frame.

```js
// src/lib/flow.js — target
export const FLOW_RATE = 10; // cells per second and frames per second: one cell per frame
const SPEED = FLOW_RATE;
```

```js
// src/components/AsciiFlow.jsx — target
import { findWires, flowFrame, FLOW_RATE } from '../lib/flow';
const FPS = FLOW_RATE;
```

## Repo conventions to follow

- Pure motion maths lives in `src/lib/*.js` with a matching `*.test.js` (exemplar: `src/lib/flow.test.js`).
- Components import constants from `src/lib` instead of duplicating numbers.

## Steps

1. In `src/lib/flow.js`, replace line 4 with the two lines from Target.
2. In `src/components/AsciiFlow.jsx`, add `FLOW_RATE` to the existing import from `../lib/flow` and replace `const FPS = 12;` with `const FPS = FLOW_RATE;`.
3. In `src/lib/flow.test.js`, import `FLOW_RATE` and replace every `1 / 9` with `1 / FLOW_RATE`.

## Boundaries

- Do NOT change `GAP`, `TRAIL` or the wire parsing.
- Do NOT add dependencies.
- If the lines above differ from the code you find, STOP and report.

## Verification

- **Mechanical**: `npx vitest run` passes; `npm run build` succeeds.
- **Feel check**: watch one packet on a project card for five seconds. It must glide one cell at a time with no pauses or double steps. Screen-record and step frame by frame: on every changed frame the head moves exactly one cell.
- **Done when**: no on-screen frame shows a head in the same cell twice in a row.
