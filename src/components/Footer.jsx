import React from 'react';
import { profile } from '../data/content';
import ScrambleText from './ScrambleText';
import SocialLinks from './SocialLinks';

// Taipei, where this page is written from: 101 in the middle of a low skyline.
const SKYLINE = String.raw`
                         |
                        /_\
                       |___|
                      /_____\
        _             |_____|            __
   __  | |   _       /_______\    _    |  |   _
  |  | | |__| |__    |_______|   | |__ |  |__| |
__|__|_|_|__|_|__|__/_________\__|_|__||__|__|_|__`.slice(1);

export default function Footer() {
  return (
    <footer id="contact" className="contact">
      {/* Headline font (Pixelta) has no apostrophe glyph, so keep display copy apostrophe-free. */}
      <ScrambleText as="h2" text="Get in touch" />
      <p className="contact-copy">
        Open to internships, research collaborations and freelance work in AI/ML, full-stack development and DevOps.
        Email is the fastest way to reach me.
      </p>
      <a className="contact-email" href={`mailto:${profile.email}`}>
        <span aria-hidden="true">&gt; </span>
        {profile.email}
      </a>
      <SocialLinks className="contact-socials" />
      <pre className="skyline" aria-hidden="true">{SKYLINE}</pre>
      <div className="copyright">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{profile.location}</span>
      </div>
    </footer>
  );
}
