// Single source of truth for JS-driven motion timing (CSS mirrors these with
// --ease and literal durations). No animation library: every effect is CSS,
// a View Transition, or a small requestAnimationFrame loop.

// Frame rates for the ASCII loops: the hero draws the eye, background fields drift.
export const frameRates = { hero: 24, weather: 20, field: 14, morph: 24 };

export const motionTokens = {
  duration: {
    fast: 0.18, // feedback
    normal: 0.3, // boot dissolve
    wipeCover: 0.08, // page-wipe cover
    wipeReveal: 0.12, // page-wipe reveal
  },
};

/** Cubic ease-out for hand-rolled tweens: fast start, gentle settle. */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
