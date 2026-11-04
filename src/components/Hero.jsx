import React, { useEffect, useState } from 'react';
import { profile } from '../data/content';
import useReducedMotion from '../hooks/useReducedMotion';
import AsciiField from './AsciiField';

/**
 * Hero. Content is visible in the default state (no script-dependent hiding):
 * the boot screen dissolving over it is the page's one entrance moment.
 */
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
      <div className="hero-content">
        <h1>
          {first}
          <br />
          {rest.join(' ')}
        </h1>
        <p className="hero-role">
          <span className="prompt-sign" aria-hidden="true">&gt; </span>
          {profile.role}
          <span className="caret" aria-hidden="true">_</span>
        </p>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#projects">
            <span aria-hidden="true">&gt;</span>
            <span>view projects</span>
          </a>
          <a className="btn" href={`mailto:${profile.email}`}>
            <span aria-hidden="true">&gt;</span>
            <span>email me</span>
          </a>
        </div>
        <p className="hero-status">
          <span className="status-dot" aria-hidden="true" />
          {profile.status}
        </p>
      </div>
      <button
        type="button"
        className="hero-toggle"
        onClick={() => setPlaying((value) => !value)}
        aria-label={playing ? 'Pause background animation' : 'Play background animation'}
      >
        <span aria-hidden="true">{playing ? '[ || pause ascii ]' : '[ > play ascii ]'}</span>
      </button>
    </section>
  );
}
