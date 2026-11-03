import React, { useEffect, useState } from 'react';
import { m } from 'motion/react';
import { profile } from '../data/content';
import { motionTokens, riseVariants, springs } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';
import AsciiField from './AsciiField';
import SocialLinks from './SocialLinks';

const COMMAND = 'whoami';

// Typewriter: characters appear one by one, then the rest of the hero rises in.
const typeVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: motionTokens.stagger.type } },
};
const charVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};
const introVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: COMMAND.length * motionTokens.stagger.type + motionTokens.duration.fast,
      staggerChildren: motionTokens.stagger.list,
    },
  },
};
const tap = { scale: motionTokens.scale.press };

export default function Hero() {
  const [first, ...rest] = profile.name.split(' ');
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);

  // Respect the OS setting by default; the visitor can still press play.
  useEffect(() => {
    setPlaying(!reducedMotion);
  }, [reducedMotion]);

  return (
    <section className="hero" id="top">
      <AsciiField className="hero-field" playing={playing} />
      <m.div className="hero-content" initial="hidden" animate="visible" variants={introVariants}>
        <p className="prompt">
          <span className="prompt-sign" aria-hidden="true">$</span>{' '}
          <span className="sr-only">{COMMAND}</span>
          <m.span variants={typeVariants} initial="hidden" animate="visible" aria-hidden="true">
            {COMMAND.split('').map((char, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <m.span key={index} variants={charVariants} data-reveal="">{char}</m.span>
            ))}
          </m.span>
          <span className="caret" aria-hidden="true">_</span>
        </p>
        <h1>
          {first}
          <br />
          {rest.join(' ')}
        </h1>
        <m.p className="hero-role" variants={riseVariants} data-reveal="">{profile.role}</m.p>
        <m.p className="hero-summary" variants={riseVariants} data-reveal="">{profile.summary}</m.p>
        <m.div className="hero-actions" variants={riseVariants} data-reveal="">
          <m.a className="btn btn-primary" href="#projects" whileTap={tap} transition={springs.snappy}>
            <span aria-hidden="true">&gt;</span>
            <span>view projects</span>
          </m.a>
          <m.a className="btn" href={`mailto:${profile.email}`} whileTap={tap} transition={springs.snappy}>
            <span aria-hidden="true">&gt;</span>
            <span>email me</span>
          </m.a>
        </m.div>
        <m.p className="hero-status" variants={riseVariants} data-reveal="">
          <span className="status-dot" aria-hidden="true" />
          {profile.status}
        </m.p>
        <m.div variants={riseVariants} data-reveal="">
          <SocialLinks primaryOnly className="hero-socials" />
        </m.div>
      </m.div>
      <button
        type="button"
        className="hero-toggle"
        onClick={() => setPlaying((value) => !value)}
        aria-label={playing ? 'Pause background animation' : 'Play background animation'}
      >
        <span aria-hidden="true">{playing ? '[ || pause ascii ]' : '[ > play ascii ]'}</span>
      </button>
      <a className="hero-scroll" href="#about">
        scroll <span className="hero-scroll-arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
