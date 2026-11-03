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

/**
 * The `+-----` rule under a heading draws itself left to right. It follows its
 * parent's `hidden`/`visible` variants (SectionHeading), so it is never itself
 * an observed, fully clipped target.
 */
export function DrawRule({ className = 'ascii-rule' }) {
  const reduced = useReducedMotion();
  const variants = {
    hidden: { clipPath: 'inset(0 100% 0 0)' },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      transition: {
        duration: reduced ? 0 : motionTokens.duration.slow,
        delay: reduced ? 0 : motionTokens.duration.fast,
        ease: motionTokens.easing.out,
      },
    },
  };
  return <m.span className={className} aria-hidden="true" data-reveal="" variants={variants} />;
}
