import React from 'react';
import { profile } from '../data/content';
import SocialLinks from './SocialLinks';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="avatar" aria-hidden="true">MF</div>
      <div>
        <h1>{profile.name}</h1>
        <div className="role">{profile.role}</div>
        <SocialLinks />
      </div>
    </section>
  );
}
