# 003 — Cut the full-bleed nebula's paint cost

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 2 files, ~20 lines

## Problem

The Expertise background repaints a full-viewport ASCII field (about 170 x 70 cells in 4 stacked `<pre>` layers) at 20 fps, and its container has a `mask-image`, so the browser re-composites the masked area on every frame.

```js
// src/components/NebulaStage.jsx:47 — current
useAsciiLoop(wrapRef, probeRef, draw, { playing, fps: 20, redrawKey: playing ? null : stage });
```

```css
/* src/styles/global.css:321 — current (excerpt) */
.stage-bg {
  position: sticky; top: 0; z-index: 0;
  height: 100svh; margin-bottom: -100svh;
  /* ... */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%);
}
.nebula-stage .ascii-field-pre { font-size: 12px; line-height: 14px; }
```

## Target

1. 14 fps while idle, 24 fps only during the 0.7 s morph. `useAsciiLoop` restarts its loop when `fps` changes, so derive it from a `morphing` state.
2. Replace the mask with two static gradient overlays that are painted once:

```css
.stage-bg { /* remove both mask-image declarations */ }
.stage-bg::before, .stage-bg::after {
  content: ''; position: absolute; left: 0; right: 0; height: 14%;
  z-index: 1; pointer-events: none;
}
.stage-bg::before { top: 0; background: linear-gradient(to bottom, var(--bg), transparent); }
.stage-bg::after { bottom: 0; background: linear-gradient(to top, var(--bg), transparent); }
```

3. Bigger cells on phones, so each frame has fewer cells:

```css
@media (max-width: 560px) { .nebula-stage .ascii-field-pre { font-size: 15px; line-height: 17px; } }
```

## Repo conventions to follow

- Frame rates are passed to `useAsciiLoop` (exemplar: `src/components/WeatherBackdrop.jsx:23`).
- Decorative overlays use `pointer-events: none` (exemplar: `.ascii-flow-trail` in `global.css`).

## Steps

1. In `NebulaStage.jsx`, add `const [morphing, setMorphing] = useState(false);`. In the effect that reacts to `stage`, after updating `morphRef`, call `setMorphing(true)`, then `const id = setTimeout(() => setMorphing(false), MORPH_S * 1000 + 50);` and return `() => clearTimeout(id)`.
2. Pass `fps: morphing ? 24 : 14` to `useAsciiLoop`.
3. Apply the CSS from Target 2 and 3 in `src/styles/global.css` (put 3 inside the existing `@media (max-width: 560px)` block).

## Boundaries

- Do NOT change shapes, colours or layout.
- Do NOT touch the hero (`AsciiField`) or the weather field.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: in Chrome DevTools > Performance, record 5 s of scrolling through Expertise. Idle frames should show no composite spike on every frame. The morph between steps must still look fluid.
- Reduced motion: the stage repaints once per step and does not animate.
- **Done when**: the top and bottom fades look as before in both themes, and the trace shows fewer paint and composite events per second.
