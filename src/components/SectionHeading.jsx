import React, { useState } from 'react';
import { m } from 'motion/react';
import ScrambleText from './ScrambleText';
import { DrawRule } from './Reveal';
import { motionTokens } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Section heading that "prints" in: a scanline sweeps down while the block is
 * revealed top-to-bottom, then the title decodes and the rule draws.
 *
 * The observed element (outer header) is never clipped: a fully clipped target
 * has a 0x0 intersection rect, which IntersectionObserver may report as not
 * intersecting. The clip lives on an inner element driven by variants instead.
 */
export default function SectionHeading({ index, kicker, title }) {
  const [entered, setEntered] = useState(false);
  const reduced = useReducedMotion();
  const body = {
    hidden: { clipPath: 'inset(0 0 100% 0)' },
    visible: {
      clipPath: 'inset(0 0 0% 0)',
      transition: { duration: reduced ? 0 : motionTokens.duration.slow, ease: motionTokens.easing.out },
    },
  };
  return (
    <m.header
      className={`section-head${entered ? ' is-in' : ''}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: motionTokens.viewportMargin }}
      onViewportEnter={() => setEntered(true)}
    >
      <m.div className="section-head-body" data-reveal="" variants={body}>
        <p className="kicker">
          <span className="kicker-index">{index}</span>
          <span className="kicker-path">~/{kicker}</span>
        </p>
        <ScrambleText as="h2" text={title} />
        <DrawRule />
      </m.div>
    </m.header>
  );
}
