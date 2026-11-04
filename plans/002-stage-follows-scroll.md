# 002 — Pick the active expertise step from scroll position

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 1 component + 1 test, ~30 lines

## Problem

`src/components/Expertise.jsx:23-41` recomputes the active step only when an IntersectionObserver fires (a step crossing the middle band). A fast scroll, a nav-link jump or a page-wipe jump can land without a crossing event, so the nebula shape and caption show the wrong area until the next crossing.

```js
// src/components/Expertise.jsx:41 — current
const observer = new IntersectionObserver(pick, { rootMargin: '-40% 0px -40% 0px' });
steps.forEach((step) => observer.observe(step));
```

## Target

Use the repo's scroll-linked hook, which runs `update` at most once per frame on scroll and resize while the section is on screen. The rule stays the same (closest step centre to the viewport middle), but `setActive` runs only when the index changes.

```js
// target, inside Expertise()
const activeRef = useRef(0);
const update = useCallback((list) => {
  const mid = window.innerHeight / 2;
  const steps = [...list.querySelectorAll('.stage-step')];
  let best = 0;
  let bestDistance = Infinity;
  steps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - mid);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  if (best !== activeRef.current) {
    activeRef.current = best;
    setActive(best);
  }
}, []);
useScrollLinked(listRef, update);
```

## Repo conventions to follow

- Exemplar: `src/components/Experience.jsx:21-35` (`update` wrapped in `useCallback`, read then write, `useScrollLinked(timelineRef, update)`).

## Steps

1. In `src/components/Expertise.jsx`, import `useCallback` from React and `useScrollLinked` from `../hooks/useScrollLinked`.
2. Delete the `useEffect` that creates the IntersectionObserver (about lines 21-44).
3. Add the `activeRef`, `update` and `useScrollLinked(listRef, update)` block from Target.
4. In `src/components/stages.test.jsx`, the test "activates the step closest to the middle of the screen" calls `io.trigger(true)`. Replace it with a scroll event plus an animation-frame step, following how `src/components/motion.test.jsx` tests the Experience timeline.

## Boundaries

- Do NOT change `NebulaStage`, the shapes or the CSS.
- Do NOT add dependencies.
- If the observer block does not match, STOP and report.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: click "expertise" in the nav, then drag the scrollbar fast to the third step and release. The caption must read `[ deploy ] rolling deploy` as soon as scrolling stops, and the gas starts morphing immediately.
- **Done when**: no scroll path leaves the caption on a step that is not centred.
