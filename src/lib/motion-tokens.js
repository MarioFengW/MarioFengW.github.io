// Single source of truth for motion. Components import these; no inline numbers.

export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.18,
    normal: 0.3,
    slow: 0.5,
    crawl: 1.4,
  },
  easing: {
    smooth: [0.2, 0.8, 0.2, 1],
    out: [0.16, 1, 0.3, 1],
    linear: 'linear',
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  scale: {
    press: 0.97,
    pop: 1.03,
  },
  stagger: {
    type: 0.07, // typewriter, per character
    list: 0.08, // list items (0.05–0.10 range)
  },
  viewportMargin: '-80px',
};

export const springs = {
  snappy: { type: 'spring', stiffness: 500, damping: 32 },
  gentle: { type: 'spring', stiffness: 220, damping: 28 },
};

/** Cubic ease-out for hand-rolled tweens (matches the feel of easing.out). */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/** Variants for a list whose children rise in one after another. */
export const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: motionTokens.stagger.list } },
};

/** Variants for one rising item; pairs with listVariants. */
export const riseVariants = {
  hidden: { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
};
