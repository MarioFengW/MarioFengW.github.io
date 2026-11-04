import React, { useRef, useState } from 'react';
import { profile, socials } from '../data/content';
import { routeLines, routePath } from '../lib/routes';
import useReducedMotion from '../hooks/useReducedMotion';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { broadcast } from '../lib/stages';
import AsciiFlow from './AsciiFlow';
import ScrambleText from './ScrambleText';

const ROUTES = routeLines(socials.length);
const CONTACT_FOCUS = { key: 'contact', shape: broadcast, label: '[ you ] say hi' };
const JOURNEY = ['Guadalajara, MX --------> Taipei, TW'];

function linkProps(href) {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/**
 * Contact as a wiring diagram: a wire from "you" fans out to each channel and
 * packets of nebula light travel to them. Each wire ends at a real link.
 */
function finePointer() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default function Footer() {
  const reducedMotion = useReducedMotion();
  useNebulaFocus('contact', CONTACT_FOCUS);
  const [bursts, setBursts] = useState([]);
  const nextId = useRef(0);

  // Hovering or focusing a channel sends one packet from "you" down its wire.
  // It never delays the link: navigation and focus happen immediately.
  const send = (index) => {
    if (reducedMotion) return;
    nextId.current += 1;
    const burst = { id: nextId.current, path: routePath(ROUTES, index) };
    setBursts((current) => [...current.slice(-5), burst]);
  };

  return (
    <footer id="contact" className="contact">
      {/* Headline font (Pixelta) has no apostrophe glyph, so keep display copy apostrophe-free. */}
      <ScrambleText as="h2" text="Get in touch" />
      <p className="contact-copy">
        Open to internships, research collaborations and freelance work in AI/ML, full-stack development and DevOps.
        Email is the fastest way to reach me.
      </p>
      <div className="contact-map">
        <AsciiFlow className="contact-wires" lines={ROUTES} bursts={bursts} />
        <ul className="contact-routes">
          {socials.map((link, index) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...linkProps(link.href)}
                onPointerEnter={() => finePointer() && send(index)}
                onFocus={() => send(index)}
              >
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
