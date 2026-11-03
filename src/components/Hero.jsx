import React from 'react';
import { profile } from '../data/content';
import AsciiField from './AsciiField';
import SocialLinks from './SocialLinks';

export default function Hero() {
  const [first, ...rest] = profile.name.split(' ');
  return (
    <section className="hero" id="top">
      <AsciiField className="hero-field" />
      <div className="hero-content">
        <p className="prompt">
          <span className="prompt-sign" aria-hidden="true">$</span> whoami
        </p>
        <h1>
          {first}
          <br />
          {rest.join(' ')}
        </h1>
        <p className="hero-role">{profile.role}</p>
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
        <SocialLinks primaryOnly className="hero-socials" />
      </div>
      <a className="hero-scroll" href="#about">
        scroll <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
