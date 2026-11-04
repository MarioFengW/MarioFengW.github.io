import React from 'react';
import { profile } from '../data/content';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { heroGas } from '../lib/stages';

/**
 * Hero. Content is visible in the default state (no script-dependent hiding):
 * the boot screen dissolving over it is the page's one entrance moment.
 */
const HERO_FOCUS = { key: 'hero', shape: heroGas, label: '' };

export default function Hero() {
  const [first, ...rest] = profile.name.split(' ');
  useNebulaFocus('top', HERO_FOCUS);

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <h1 data-clearing="">
          {first}
          <br />
          {rest.join(' ')}
        </h1>
        <p className="hero-role" data-clearing="">
          <span className="prompt-sign" aria-hidden="true">&gt; </span>
          {profile.role}
          <span className="caret" aria-hidden="true">_</span>
        </p>
        <p className="hero-summary" data-clearing="">{profile.summary}</p>
        <p className="hero-proof" data-clearing="">{profile.proof}</p>
        <div className="hero-actions" data-clearing="">
          <a className="btn btn-primary" href="#projects">
            <span aria-hidden="true">&gt;</span>
            <span>view projects</span>
          </a>
          <a className="btn" href={`mailto:${profile.email}`}>
            <span aria-hidden="true">&gt;</span>
            <span>email me</span>
          </a>
          <a className="btn btn-quiet" href={profile.resume} target="_blank" rel="noopener noreferrer">
            <span>resume</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="hero-status" data-clearing="">
          <span className="status-dot" aria-hidden="true" />
          {profile.status}
        </p>
      </div>
    </section>
  );
}
