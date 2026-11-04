import React from 'react';
import { profile, socials } from '../data/content';
import { routeLines } from '../lib/routes';
import AsciiFlow from './AsciiFlow';
import ScrambleText from './ScrambleText';

const ROUTES = routeLines(socials.length);
const JOURNEY = ['Guadalajara, MX --------> Taipei, TW'];

function linkProps(href) {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/**
 * Contact as a wiring diagram: a wire from "you" fans out to each channel and
 * packets of nebula light travel to them. Each wire ends at a real link.
 */
export default function Footer() {
  return (
    <footer id="contact" className="contact">
      {/* Headline font (Pixelta) has no apostrophe glyph, so keep display copy apostrophe-free. */}
      <ScrambleText as="h2" text="Get in touch" />
      <p className="contact-copy">
        Open to internships, research collaborations and freelance work in AI/ML, full-stack development and DevOps.
        Email is the fastest way to reach me.
      </p>
      <div className="contact-map">
        <AsciiFlow className="contact-wires" lines={ROUTES} />
        <ul className="contact-routes">
          {socials.map((link) => (
            <li key={link.label}>
              <a href={link.href} {...linkProps(link.href)}>
                <span className="contact-route-label">{link.label}</span>
                <span className="contact-route-handle">{link.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="copyright">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <AsciiFlow className="copyright-journey" lines={JOURNEY} />
        <span className="sr-only">{profile.location}</span>
      </div>
    </footer>
  );
}
