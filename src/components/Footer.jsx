import React, { useEffect, useRef, useState } from 'react';
import { currentCity, profile, socials } from '../data/content';
import { routeLines, routePath } from '../lib/routes';
import { composeMailto, localTime, TOPICS } from '../lib/compose';
import useReducedMotion from '../hooks/useReducedMotion';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { broadcast } from '../lib/stages';
import AsciiFlow from './AsciiFlow';
import ScrambleText from './ScrambleText';

// Secondary channels: everything except email (the composer covers it), plus the resume.
export const CHANNELS = [
  ...socials.filter((link) => link.label !== 'email'),
  { label: 'resume', href: profile.resume, handle: 'resume.pdf' },
];
const ROUTES = routeLines(CHANNELS.length);
const JOURNEY = ['Guadalajara, MX --------> Taipei, TW'];
const CONTACT_FOCUS = { key: 'contact', shape: broadcast, label: '' };
const COPIED_MS = 1600;

function linkProps(href) {
  return /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function finePointer() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Contact as a terminal session: `mail mario` composes the email with you (the
 * send link opens your mail client with subject and message filled in), the
 * address can be copied, and the other channels hang off a small wiring diagram.
 * Without JavaScript the send link is still a plain mailto.
 */
export default function Footer() {
  const reducedMotion = useReducedMotion();
  useNebulaFocus('contact', CONTACT_FOCUS);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(null);
  const [bursts, setBursts] = useState([]);
  const nextId = useRef(0);

  // Local time in Taipei, refreshed every 30 s (read after mount: static HTML never shows a stale time).
  useEffect(() => {
    const tick = () => setTime(localTime(new Date(), currentCity.timeZone));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const id = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false); // clipboard blocked: the address stays visible to select by hand
    }
  };

  // Hovering or focusing a channel sends one packet down its wire; never delays the link.
  const send = (index) => {
    if (reducedMotion) return;
    nextId.current += 1;
    const burst = { id: nextId.current, path: routePath(ROUTES, index) };
    setBursts((current) => [...current.slice(-5), burst]);
  };

  const href = composeMailto(profile.email, { topic, name, message });

  return (
    <footer id="contact" className="contact">
      {/* Headline font (Pixelta) has no apostrophe glyph, so keep display copy apostrophe-free. */}
      <ScrambleText as="h2" text="Get in touch" />
      <p className="contact-copy">
        Open to internships, research collaborations and freelance work in AI/ML, full-stack development and DevOps.
      </p>

      <div className="contact-body">
        <div className="contact-side">
          <div className="contact-map">
            <AsciiFlow className="contact-wires" lines={ROUTES} bursts={bursts} />
            <ul className="contact-routes">
              {CHANNELS.map((link, index) => (
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
          <div className="contact-direct">
            <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}</a>
            <button type="button" className="contact-copy-btn" onClick={copy} aria-live="polite">
              {copied ? '[ copied ]' : '[ copy ]'}
            </button>
            {time && (
              <span className="contact-time">
                {time} in {currentCity.name}
              </span>
            )}
          </div>
        </div>
        <form className="composer" onSubmit={(event) => event.preventDefault()} aria-label="Write me an email">
          <p className="composer-cmd" aria-hidden="true">
            <span className="composer-prompt">$ </span>mail mario
          </p>
          <label className="composer-row">
            <span className="composer-key">from:</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <fieldset className="composer-row">
            <legend className="composer-key">about:</legend>
            <div className="composer-topics">
              {TOPICS.map((item) => (
                <label key={item} className={`composer-topic${item === topic ? ' is-on' : ''}`}>
                  <input
                    type="radio"
                    name="topic"
                    value={item}
                    checked={item === topic}
                    onChange={() => setTopic(item)}
                  />
                  <span aria-hidden="true">{item === topic ? '(*)' : '( )'}</span> {item}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="composer-row composer-row-message">
            <span className="composer-key">message:</span>
            <textarea
              name="message"
              rows={4}
              placeholder="what are you working on?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <div className="composer-actions">
            <a className="btn btn-primary composer-send" href={href}>
              <span aria-hidden="true">&gt;</span>
              <span>send</span>
            </a>
            <span className="composer-note">opens your mail app with this filled in</span>
          </div>
        </form>
      </div>

      <div className="copyright">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <AsciiFlow className="copyright-journey" lines={JOURNEY} />
        <span className="sr-only">{profile.location}</span>
      </div>
    </footer>
  );
}
