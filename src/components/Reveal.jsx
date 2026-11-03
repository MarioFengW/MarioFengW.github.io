import React from 'react';
import { m } from 'motion/react';
import { fadeVariants, listVariants, motionTokens, riseVariants } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';

const viewport = { once: true, margin: motionTokens.viewportMargin };

/** Rise-in variants, or a short opacity-only fade when the visitor asked for reduced motion. */
export function useRiseVariants() {
  return useReducedMotion() ? fadeVariants : riseVariants;
}

/** A block that rises into place the first time it scrolls into view. */
export function Reveal({ as = 'div', children, ...rest }) {
  const Component = m[as];
  const variants = useRiseVariants();
  return (
    <Component data-reveal="" initial="hidden" whileInView="visible" viewport={viewport} variants={variants} {...rest}>
      {children}
    </Component>
  );
}

/** A list whose items (RevealItem) rise in with a stagger when it enters view. */
export function RevealList({ as = 'ul', children, ...rest }) {
  const Component = m[as];
  return (
    <Component initial="hidden" whileInView="visible" viewport={viewport} variants={listVariants} {...rest}>
      {children}
    </Component>
  );
}

export function RevealItem({ as = 'li', children, ...rest }) {
  const Component = m[as];
  const variants = useRiseVariants();
  return (
    <Component data-reveal="" variants={variants} {...rest}>
      {children}
    </Component>
  );
}

/** The `+-----` rule under a heading draws itself left to right once in view. */
export function DrawRule({ className = 'ascii-rule' }) {
  const reduced = useReducedMotion();
  return (
    <m.span
      className={className}
      aria-hidden="true"
      data-reveal=""
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={viewport}
      transition={{
        duration: reduced ? 0 : motionTokens.duration.slow,
        ease: motionTokens.easing.out,
      }}
    />
  );
}
