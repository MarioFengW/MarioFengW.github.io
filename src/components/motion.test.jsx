import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Counter, { formatCount } from './Counter';
import ScrollMeter, { scrollProgress } from './ScrollMeter';
import Highlights from './Highlights';
import Hero from './Hero';
import { Reveal } from './Reveal';
import { asciiProgress } from '../lib/ascii';
import { easeOutCubic } from '../lib/motion-tokens';
import { highlights } from '../data/content';
import { renderWithMotion } from '../test/render';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

afterEach(() => {
  vi.unstubAllGlobals();
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
    expect(asciiProgress(Infinity, 4)).toBe('[....]   0%');
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

describe('Counter', () => {
  it('formats with fixed decimals and thousands separators', () => {
    expect(formatCount(45000)).toBe('45,000');
    expect(formatCount(89.456, 2)).toBe('89.46');
    expect(formatCount(0, 2)).toBe('0.00');
  });

  it('server-renders the final value', () => {
    mockReducedMotion(false);
    mockIntersectionObserver(); // never triggered
    render(<Counter value={3000} />);
    expect(screen.getByText('3,000')).toBeInTheDocument();
  });

  it('counts up from 0 once it scrolls into view', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    render(<Counter value={90} />);
    const node = screen.getByText('90');

    io.trigger(false);
    expect(node.textContent).toBe('90');

    io.trigger(true);
    expect(node.textContent).toBe('0');
    raf.step(1000); // first frame sets the start time
    expect(node.textContent).toBe('0');
    raf.step(1000 + 700); // halfway through 1.4s
    const mid = Number(node.textContent);
    expect(mid).toBeGreaterThan(45); // ease-out is past the midpoint
    expect(mid).toBeLessThan(90);
    raf.step(1000 + 5000);
    expect(node.textContent).toBe('90');
    expect(raf.pending()).toBe(0);

    io.trigger(true); // once only
    expect(node.textContent).toBe('90');
  });

  it('restores the final value if unmounted mid-count', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { unmount } = render(<Counter value={89.46} decimals={2} />);
    const node = screen.getByText('89.46');
    io.trigger(true);
    raf.step(0);
    raf.step(300);
    unmount();
    expect(node.textContent).toBe('89.46');
    expect(raf.pending()).toBe(0);
  });

  it('does not animate with reduced motion or without IntersectionObserver', () => {
    mockReducedMotion(true);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    render(<Counter value={45000} />);
    // The hook reads the media query after the first render, so an observer may be
    // created and must be torn down again; either way, nothing ever animates.
    expect(io.instances.every((o) => o.disconnected)).toBe(true);
    io.trigger(true);
    expect(raf.pending()).toBe(0);
    expect(screen.getByText('45,000')).toBeInTheDocument();

    mockReducedMotion(false);
    const original = window.IntersectionObserver;
    delete window.IntersectionObserver;
    try {
      render(<Counter value={12} />);
      expect(screen.getByText('12')).toBeInTheDocument();
    } finally {
      window.IntersectionObserver = original;
    }
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
    expect(scrollProgress()).toBe(0); // page shorter than the window
  });

  it('is decorative and updates on scroll (throttled to one frame)', () => {
    const raf = mockAnimationFrame();
    setScroll({ scrollHeight: 3000, innerHeight: 1000, scrollY: 0 });
    const { container, unmount } = render(<ScrollMeter />);
    const meter = container.querySelector('.scroll-meter');
    expect(meter).toHaveAttribute('aria-hidden', 'true');
    expect(meter.textContent).toBe(asciiProgress(0));

    setScroll({ scrollHeight: 3000, innerHeight: 1000, scrollY: 1000 });
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll')); // coalesced into the same frame
    expect(raf.pending()).toBe(1);
    raf.step(16);
    expect(meter.textContent).toBe(asciiProgress(0.5));

    window.dispatchEvent(new Event('resize'));
    unmount();
    expect(raf.pending()).toBe(0);
  });
});

describe('Highlights', () => {
  it('renders every impact number with its label', () => {
    mockReducedMotion(true);
    renderWithMotion(<Highlights />);
    highlights.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
      expect(screen.getByText(formatCount(item.value, item.decimals))).toBeInTheDocument();
    });
  });
});

describe('Reveal', () => {
  it('starts hidden and becomes visible once in view', async () => {
    renderWithMotion(<Reveal as="p">hello</Reveal>);
    const node = screen.getByText('hello');
    expect(node).toHaveAttribute('data-reveal');
    await waitFor(() => expect(node).toBeVisible());
  });
});

describe('Hero animation toggle', () => {
  it('plays by default and can be paused and resumed', () => {
    mockReducedMotion(false);
    renderWithMotion(<Hero />);
    const toggle = screen.getByRole('button', { name: 'Pause background animation' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Play background animation');
    expect(toggle).toHaveTextContent('[ > play ascii ]');
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Pause background animation');
  });

  it('starts paused when the OS asks for reduced motion, but can still be played', () => {
    const setReduced = mockReducedMotion(true);
    renderWithMotion(<Hero />);
    const toggle = screen.getByRole('button', { name: 'Play background animation' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Pause background animation');
    act(() => setReduced(false));
    expect(toggle).toHaveAccessibleName('Pause background animation');
  });
});
