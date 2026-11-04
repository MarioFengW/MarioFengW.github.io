# 010 — Let the expertise nebula swirl around the pointer, like the hero

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW (missed opportunity, additive)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file, ~5 lines
- **Depends on**: 003 (frame-rate budget)

## Problem

The hero's nebula swirls and brightens around the pointer (`src/components/AsciiField.jsx:23` passes `trackPointer: true`, and `nebulaSample` in `src/lib/nebula.js` takes a `pointer`). The full-bleed expertise nebula ignores the pointer, so the page's one visual entity behaves like two different things.

```js
// src/components/NebulaStage.jsx — current
const frames = renderNebulaLayers(cols, rows, t, null, shape);
// ...
useAsciiLoop(wrapRef, probeRef, draw, { playing, fps: 20, redrawKey: playing ? null : stage });
```

## Target

```js
const draw = useCallback((cols, rows, t, pointer) => {
  // ...
  const frames = renderNebulaLayers(cols, rows, t, pointer, shape);
  // ...
}, [playing]);

useAsciiLoop(wrapRef, probeRef, draw, { playing, fps: /* from plan 003 */, trackPointer: true, redrawKey: playing ? null : stage });
```

`.stage-bg` sits under the steps (`z-index: 0`). `useAsciiLoop` already tracks the pointer at window level and maps it into the field's box, so the steps on top do not block it.

## Steps

1. Add the `pointer` parameter to `draw` and pass it to `renderNebulaLayers`.
2. Add `trackPointer: true` to the `useAsciiLoop` options.

## Boundaries

- Do NOT change `nebulaSample`'s swirl strength.
- Only fine pointers matter here; on touch there is no pointer move and nothing changes.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: move the mouse slowly across the left half of Expertise: the gas swirls and brightens around the cursor with the same eased lag as in the hero. Over the text column, the thin gas reacts faintly. Reading is not disturbed.
- **Done when**: the hero and the expertise nebula respond to the pointer the same way.
