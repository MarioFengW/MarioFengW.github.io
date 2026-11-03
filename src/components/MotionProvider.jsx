import React from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

/**
 * Loads only the DOM animation features (no drag/layout engine) and makes every
 * motion component honour the OS "reduce motion" setting: transforms are skipped,
 * opacity fades still run.
 *
 * Note: an async `features={() => import(...)}` was tried and gave no saving here,
 * because Gatsby already loads the page as an async chunk that shares the
 * `motion/react` barrel, so webpack keeps domAnimation in the page chunk anyway.
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
