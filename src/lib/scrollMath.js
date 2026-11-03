// Pure maths behind the scroll-linked effects (no DOM; unit-tested).
import { clamp } from './ascii';

/**
 * How far the reader has read through a timeline: 0 before its top reaches the
 * reading line (`anchor` of the viewport height), 1 once its bottom passes it.
 */
export function timelineProgress(top, height, viewportHeight, anchor = 0.55) {
  if (height <= 0) return 0;
  return clamp((viewportHeight * anchor - top) / height, 0, 1);
}

/** Share (0..1) of a stuck card that the next card in the stack now covers. */
export function stackCover(cardRect, nextRect) {
  if (!nextRect || cardRect.height <= 0) return 0;
  return clamp((cardRect.top + cardRect.height - nextRect.top) / cardRect.height, 0, 1);
}

const MAX_SHRINK = 0.06; // a covered card settles at 94% scale...
const MAX_SHADE = 0.5; // ...and half-dimmed, so it reads as "behind"

/** Depth for a card covered by `cover` (0..1): it shrinks and darkens as it recedes. */
export function stackDepth(cover) {
  const c = clamp(cover, 0, 1);
  return { scale: 1 - MAX_SHRINK * c, shade: MAX_SHADE * c };
}
