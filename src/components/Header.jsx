import React, { useEffect, useState } from 'react';
import ScrollMeter from './ScrollMeter';
import ThemeToggle from './ThemeToggle';
import MotionToggle from './MotionToggle';

export const navItems = ['about', 'expertise', 'experience', 'projects', 'resume', 'contact'];

/** Tracks which section is in the reading zone (a band just under the header). */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      // Only a thin band ~30% down the viewport counts, so exactly one section wins.
      { rootMargin: '-30% 0px -69% 0px' }
    );
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(navItems);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <a className="nav-mark" href="#top">
          <span className="nav-prompt" aria-hidden="true">~/</span>mario-feng-wu
          <span className="caret" aria-hidden="true">_</span>
        </a>
        <ScrollMeter />
        <MotionToggle />
        <ThemeToggle />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '[ close ]' : '[ menu ]'}
        </button>
        <nav id="primary-nav" className={`links${open ? ' is-open' : ''}`} aria-label="Primary">
          <ul>
            {navItems.map((item, index) => (
              <li key={item} style={{ '--i': index }}>
                <a
                  href={`#${item}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === item ? 'location' : undefined}
                >
                  <span className="link-label">{item}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
