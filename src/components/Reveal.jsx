import React from 'react';
import { m } from 'motion/react';
import { listVariants, motionTokens, riseVariants } from '../lib/motion-tokens';

const viewport = { once: true, margin: motionTokens.viewportMargin };

/** A block that rises into place the first time it scrolls into view. */
export function Reveal({ as = 'div', children, ...rest }) {
  const Component = m[as];
  return (
    <Component data-reveal="" initial="hidden" whileInView="visible" viewport={viewport} variants={riseVariants} {...rest}>
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
  return (
    <Component data-reveal="" variants={riseVariants} {...rest}>
      {children}
    </Component>
  );
}
