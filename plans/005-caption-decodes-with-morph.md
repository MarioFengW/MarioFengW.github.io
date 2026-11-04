# 005 — Tie the stage caption and step highlight to the nebula morph

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 3 files, ~20 lines

## Problem

When the active area changes, the gas morphs over 0.7 s (`MORPH_S` in `src/components/NebulaStage.jsx:6`), but the caption text swaps instantly and the step text changes colour with an unrelated 0.3 s transition. Three things change at once with no shared motion.

```jsx
// src/components/Expertise.jsx — current (stage HUD)
<p className="stage-caption">
  <span className="stage-caption-node">[ {current.node} ]</span> {current.shape}
</p>
```

```css
/* src/styles/global.css — current */
.stage-step { /* ... */ color: var(--ink-faint); transition: color .3s var(--ease); }
.stage-step-node { font-size: var(--fs-xs); transition: color .3s var(--ease); }
```

## Target

- The caption decodes from glyphs like the section headings, keyed on the active step so it replays on each change. Reuse `ScrambleText` (`src/components/ScrambleText.jsx`), which already respects reduced motion and keeps the real text available to assistive tech.
- The step colour transition matches the morph so both settle together: `.7s var(--ease)` instead of `.3s`.

```jsx
// target
<p className="stage-caption">
  <ScrambleText key={active} as="span" text={`[ ${current.node} ] ${current.shape}`} immediate />
</p>
```

## Repo conventions to follow

- `ScrambleText` usage: `src/components/SectionHeading.jsx` (`<ScrambleText as="h2" text={title} />`).
- `--ease` is the repo's strong ease-out: `cubic-bezier(.16, 1, .3, 1)`.

## Steps

1. Read `ScrambleText.jsx`. It plays once when first seen (IntersectionObserver). Add an optional `immediate` prop: when true, start the decode on mount instead of waiting for intersection. Keep the reduced-motion early return.
2. Replace the caption markup with the Target JSX.
3. In `global.css`, change `.3s` to `.7s` in the `.stage-step` and `.stage-step-node` transitions.
4. Add a test in `src/components/animated.test.jsx` that `immediate` starts without an intersection.

## Boundaries

- Do NOT change `MORPH_S`.
- Do NOT change section headings.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: scroll from step 1 to step 2. The caption decodes while the gas re-forms, and both finish together; the new step's text brightens at the same pace. At 10% playback, the decode ends no later than the morph.
- Reduced motion: the caption changes instantly with no glyph noise.
- **Done when**: no part of the stage change finishes clearly before the others.
