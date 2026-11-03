import React, { useEffect, useState } from 'react';
import { applyTheme, isTheme, nextTheme } from '../lib/theme';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Black / white switch. With a pointer it plays a short scanline wipe (View
 * Transitions); keyboard toggles, reduced motion and unsupported browsers
 * switch instantly.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null); // unknown until mounted (set by the head script)
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(isTheme(current) ? current : 'dark');
  }, []);

  const isLight = theme === 'light';

  const toggle = (event) => {
    const next = nextTheme(theme || 'dark');
    const keyboard = event.detail === 0; // keyboard-initiated: never animate
    if (reducedMotion || keyboard || typeof document.startViewTransition !== 'function') {
      applyTheme(next);
    } else {
      document.startViewTransition(() => applyTheme(next));
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Light theme"
      className="theme-toggle"
      onClick={toggle}
      disabled={theme === null}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        {theme === null ? '[..]' : isLight ? '[.#]' : '[#.]'}
      </span>
      <span className="theme-toggle-label" aria-hidden="true">{isLight ? 'light' : 'dark'}</span>
    </button>
  );
}
