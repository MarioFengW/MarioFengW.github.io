// Single source of truth for JS-driven motion timing (CSS mirrors these with
// --ease and literal durations). No animation library: every effect is CSS,
// a View Transition, or a small requestAnimationFrame loop.

export const motionTokens = {
  duration: {
    fast: 0.18, // feedback, page-wipe cover
    normal: 0.3, // page-wipe reveal, boot dissolve
  },
};

/** Cubic ease-out for hand-rolled tweens: fast start, gentle settle. */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
