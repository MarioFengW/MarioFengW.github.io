import React, { useEffect, useState } from 'react';

export const navItems = ['about', 'expertise', 'experience', 'projects', 'contact'];

export default function Header() {
  const [open, setOpen] = useState(false);

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
              <li key={item}>
                <a href={`#${item}`} onClick={() => setOpen(false)}>
                  <span className="link-index" aria-hidden="true">0{index + 1}</span>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
