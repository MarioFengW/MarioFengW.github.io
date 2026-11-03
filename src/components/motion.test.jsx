import React, { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ScrollMeter, { scrollProgress } from './ScrollMeter';
import Hero from './Hero';
import ThemeToggle from './ThemeToggle';
import Experience from './Experience';
import Projects from './Projects';
import useScrollLinked from '../hooks/useScrollLinked';
import { asciiProgress } from '../lib/ascii';
import { easeOutCubic } from '../lib/motion-tokens';
import { THEME_KEY, THEME_SCRIPT, applyTheme, isTheme, nextTheme, resolveTheme } from '../lib/theme';
import { stackCover, stackDepth, timelineProgress } from '../lib/scrollMath';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = '';
  window.localStorage.clear();
});

describe('asciiProgress', () => {
  it('draws an empty, half and full bar with a padded percentage', () => {
    expect(asciiProgress(0, 10)).toBe('[..........]   0%');
    expect(asciiProgress(0.5, 10)).toBe('[#####.....]  50%');
    expect(asciiProgress(1, 10)).toBe('[##########] 100%');
  });

  it('clamps out-of-range and non-finite input', () => {
    expect(asciiProgress(2, 4)).toBe('[####] 100%');
    expect(asciiProgress(-1, 4)).toBe('[....]   0%');
    expect(asciiProgress(NaN, 4)).toBe('[....]   0%');
  });

  it('keeps a constant width so the header never shifts', () => {
    const widths = [0, 0.07, 0.5, 0.99, 1].map((p) => asciiProgress(p, 16).length);
    expect(new Set(widths).size).toBe(1);
  });
});

describe('easeOutCubic', () => {
  it('starts at 0, ends at 1 and front-loads progress', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('ScrollMeter', () => {
  function setScroll({ scrollHeight, innerHeight, scrollY }) {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: scrollHeight });
    vi.stubGlobal('innerHeight', innerHeight);
    vi.stubGlobal('scrollY', scrollY);
  }

  afterEach(() => {
    delete document.documentElement.scrollHeight;
  });

  it('computes progress through the scrollable range', () => {
    setScroll({ scrollHeight: 3000, innerHeight: 1000, scrollY: 500 });
    expect(scrollProgress()).toBe(0.25);
    setScroll({ scrollHeight: 800, innerHeight: 1000, scrollY: 0 });
    expect(scrollProgress()).toBe(0);
  });

  it('is decorative and updates on scroll (throttled to one frame)', () => {
    const raf = mockAnimationFrame();
    setScroll({ scrollHeight: 3000, innerHeight: 1000, scrollY: 0 });
    const { container, unmount } = render(<ScrollMeter />);
    const meter = container.querySelector('.scroll-meter');
    expect(meter).toHaveAttribute('aria-hidden', 'true');
    setScroll({ scrollHeight: 3000, innerHeight: 1000, scrollY: 1000 });
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(raf.pending()).toBe(1);
    raf.step(16);
    expect(meter.textContent).toBe(asciiProgress(0.5));
    window.dispatchEvent(new Event('resize'));
    unmount();
    expect(raf.pending()).toBe(0);
  });
});

describe('Hero animation toggle', () => {
  it('plays by default and can be paused and resumed', () => {
    mockReducedMotion(false);
    render(<Hero />);
    const toggle = screen.getByRole('button', { name: 'Pause background animation' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Play background animation');
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Pause background animation');
  });

  it('starts paused when the OS asks for reduced motion, but can still be played', () => {
    mockReducedMotion(true);
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: 'Play background animation' }));
    expect(screen.getByRole('button', { name: 'Pause background animation' })).toBeInTheDocument();
  });
});

describe('theme', () => {
  it('validates and flips themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('sepia')).toBe(false);
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });

  it('prefers a saved choice, else the OS preference', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', true)).toBe('dark');
    expect(resolveTheme(null, true)).toBe('light');
    expect(resolveTheme('garbage', false)).toBe('dark');
  });

  it('applies to the document, updates theme-color and remembers the choice', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(meta.getAttribute('content')).toBe('#f4f2ec');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('light');
    meta.remove();
  });

  it('still applies when storage is unavailable', () => {
    const storage = { setItem: () => { throw new Error('blocked'); } };
    expect(() => applyTheme('dark', document, storage)).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('the head script picks saved theme, then OS preference, before paint', () => {
    const run = () => new Function(THEME_SCRIPT)(); // eslint-disable-line no-new-func
    window.localStorage.setItem(THEME_KEY, 'light');
    run();
    expect(document.documentElement.dataset.theme).toBe('light');
    window.localStorage.clear();
    vi.spyOn(window, 'matchMedia').mockImplementation(() => ({ matches: true }));
    run();
    expect(document.documentElement.dataset.theme).toBe('light');
    window.matchMedia.mockImplementation(() => ({ matches: false }));
    run();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark';
  });

  it('is a labelled switch reflecting the current theme', () => {
    mockReducedMotion(false);
    render(<ThemeToggle />);
    const toggle = screen.getByRole('switch', { name: 'Light theme' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveTextContent('[#.]dark');
  });

  it('pointer clicks switch through a View Transition', () => {
    mockReducedMotion(false);
    const startViewTransition = vi.fn((update) => update());
    document.startViewTransition = startViewTransition;
    try {
      render(<ThemeToggle />);
      const toggle = screen.getByRole('switch', { name: 'Light theme' });
      fireEvent.click(toggle, { detail: 1 });
      expect(startViewTransition).toHaveBeenCalledTimes(1);
      expect(document.documentElement.dataset.theme).toBe('light');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveTextContent('[.#]light');
    } finally {
      delete document.startViewTransition;
    }
  });

  it('keyboard toggles and reduced motion switch instantly', () => {
    const startViewTransition = vi.fn((update) => update());
    document.startViewTransition = startViewTransition;
    try {
      mockReducedMotion(false);
      const { unmount } = render(<ThemeToggle />);
      fireEvent.click(screen.getByRole('switch'), { detail: 0 }); // Enter / Space
      expect(startViewTransition).not.toHaveBeenCalled();
      expect(document.documentElement.dataset.theme).toBe('light');
      unmount();

      mockReducedMotion(true);
      render(<ThemeToggle />);
      fireEvent.click(screen.getByRole('switch'), { detail: 1 });
      expect(startViewTransition).not.toHaveBeenCalled();
      expect(document.documentElement.dataset.theme).toBe('dark');
    } finally {
      delete document.startViewTransition;
    }
  });

  it('falls back to an instant switch without View Transitions, and to dark when unset', () => {
    mockReducedMotion(false);
    delete document.documentElement.dataset.theme;
    render(<ThemeToggle />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle, { detail: 1 });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('scrollMath', () => {
  it('timeline progress follows the reading line through the list', () => {
    expect(timelineProgress(800, 400, 1000)).toBe(0); // top below the 55% line
    expect(timelineProgress(350, 400, 1000)).toBe(0.5);
    expect(timelineProgress(-100, 400, 1000)).toBe(1);
    expect(timelineProgress(0, 0, 1000)).toBe(0);
  });

  it('stack cover is how much of a card the next one hides', () => {
    const card = { top: 80, height: 400 };
    expect(stackCover(card, { top: 600 })).toBe(0); // next still below
    expect(stackCover(card, { top: 280 })).toBe(0.5);
    expect(stackCover(card, { top: 80 })).toBe(1);
    expect(stackCover(card, undefined)).toBe(0); // last card
    expect(stackCover({ top: 0, height: 0 }, { top: 0 })).toBe(0);
  });

  it('a covered card recedes: smaller and shaded, capped', () => {
    expect(stackDepth(0)).toEqual({ scale: 1, shade: 0 });
    expect(stackDepth(1)).toEqual({ scale: 0.94, shade: 0.5 });
    expect(stackDepth(5)).toEqual(stackDepth(1));
  });
});

describe('useScrollLinked', () => {
  function Probe({ onUpdate, enabled }) {
    const ref = useRef(null);
    useScrollLinked(ref, onUpdate, { enabled });
    return <div ref={ref} />;
  }

  it('runs once immediately, then once per frame while on screen', () => {
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const onUpdate = vi.fn();
    const { unmount } = render(<Probe onUpdate={onUpdate} />);
    expect(onUpdate).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('scroll')); // offscreen: not listening yet
    expect(raf.pending()).toBe(0);

    io.trigger(true);
    raf.step(16);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    raf.step(32);
    expect(onUpdate).toHaveBeenCalledTimes(3);

    io.trigger(false);
    window.dispatchEvent(new Event('scroll'));
    expect(raf.pending()).toBe(0);
    window.dispatchEvent(new Event('resize'));
    unmount();
    expect(raf.pending()).toBe(0);
  });

  it('does nothing when disabled, and works without IntersectionObserver', () => {
    const onUpdate = vi.fn();
    render(<Probe onUpdate={onUpdate} enabled={false} />);
    expect(onUpdate).not.toHaveBeenCalled();

    const original = window.IntersectionObserver;
    delete window.IntersectionObserver;
    try {
      const raf = mockAnimationFrame();
      render(<Probe onUpdate={onUpdate} />);
      window.dispatchEvent(new Event('scroll'));
      raf.step(16);
      expect(onUpdate.mock.calls.length).toBeGreaterThanOrEqual(2);
    } finally {
      window.IntersectionObserver = original;
    }
  });
});

describe('scroll-linked sections', () => {
  function rectFor(top, height) {
    return { top, height, bottom: top + height, left: 0, right: 800, width: 800, x: 0, y: top };
  }

  it('Experience fills the rail and marks milestones the line has reached', () => {
    mockIntersectionObserver();
    mockAnimationFrame();
    vi.stubGlobal('innerHeight', 1000);
    // Timeline 600px tall starting at y=250 -> progress (550-250)/600 = 0.5 -> reach y=550.
    const nodeTops = [270, 470, 670];
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      if (this.classList.contains('exp-timeline')) return rectFor(250, 600);
      if (this.classList.contains('exp-node')) {
        const items = [...document.querySelectorAll('.exp-node')];
        return rectFor(nodeTops[items.indexOf(this)], 10);
      }
      return rectFor(0, 0);
    });
    const { container } = render(<Experience />);
    expect(container.querySelector('.exp-progress').style.transform).toBe('scaleY(0.5)');
    const items = container.querySelectorAll('.exp-item');
    expect(items[0]).toHaveAttribute('data-passed');
    expect(items[1]).toHaveAttribute('data-passed');
    expect(items[2]).not.toHaveAttribute('data-passed');
  });

  it('Projects shrink and shade a card as the next one covers it', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    mockAnimationFrame();
    // Card 0 stuck at top=80 (h=400); card 1 has slid halfway over it.
    const tops = [80, 280, 900, 1500];
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      if (this.classList.contains('project-card')) {
        const cards = [...document.querySelectorAll('.project-card')];
        return rectFor(tops[cards.indexOf(this)], 400);
      }
      return rectFor(0, 0);
    });
    const { container } = render(<Projects />);
    const inners = container.querySelectorAll('.project-inner');
    const shades = container.querySelectorAll('.project-shade');
    expect(inners[0].style.transform).toBe('scale(0.97)');
    expect(shades[0].style.opacity).toBe('0.25');
    expect(inners[3].style.transform).toBe('scale(1)'); // last card is never covered
  });

  it('Projects keep a flat stack under reduced motion', () => {
    mockReducedMotion(true);
    mockIntersectionObserver();
    const { container } = render(<Projects />);
    container.querySelectorAll('.project-inner').forEach((inner) => expect(inner.style.transform).toBe(''));
  });
});
