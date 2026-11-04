# 004 — Keep or remove page-level scroll snapping after a device test

- **Status**: TODO — needs a real trackpad and phone test; snapping kept for now
- **Commit**: d9d3755
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file, 3-5 lines

## Problem

```css
/* src/styles/global.css:671 — current */
@media (prefers-reduced-motion: no-preference) {
  html { scroll-snap-type: y proximity; }
}
```

together with `.stage-step { scroll-snap-align: center; }` at `global.css:346`. Snapping the whole document coexists with a sticky full-bleed background, the sticky project stack and the ASCII page wipe that jumps with `scrollIntoView`. On trackpads and touch, proximity snapping can tug the page after the user lets go. This cannot be judged from code.

## Target

Keep snapping only if it passes the feel check. Otherwise remove it:

```css
/* delete the whole block above, and delete `scroll-snap-align: center;` from .stage-step */
```

## Steps

1. Build and serve the site (`npm run build`, then serve `public/`).
2. Run the feel check on a laptop trackpad and on a phone.
3. If any check fails, apply the deletion. If all pass, set Status to DONE with the note "kept after device test".

## Boundaries

- Do NOT add JS-driven snapping.
- Do NOT change the step heights.

## Verification

- **Feel check**:
  - Scroll slowly through Expertise and stop between two steps: the page must not move by itself, or if it settles, softly and toward the nearer step.
  - Fling through Expertise: no step catches the fling.
  - Click "projects" and "contact" in the nav: the page wipe lands on the section with no extra jump.
  - Scroll back up through Expertise from Experience: no tug.
- **Done when**: all four checks pass on two devices, or snapping is removed.
