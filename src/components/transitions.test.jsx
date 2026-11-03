import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import PageTransition, { getHashTarget, jumpTo } from './PageTransition';
import Header from './Header';
import WeatherStatus from './WeatherStatus';
import { DrawRule, useRiseVariants } from './Reveal';
import { RAMP, cellNoise, sweepCoverage, wipeFrame } from '../lib/ascii';
import { fadeVariants, riseVariants } from '../lib/motion-tokens';
import { renderWithMotion } from '../test/render';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

const FULL = RAMP[RAMP.length - 1];

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('ASCII wipe math', () => {
  it('cellNoise is deterministic and within 0..1', () => {
    expect(cellNoise(3, 7, 2)).toBe(cellNoise(3, 7, 2));
    for (let i = 0; i < 100; i++) {
      const v = cellNoise(i, i * 3, i % 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('every cell is empty at the start and fully covered at the end', () => {
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 40; x++) {
        expect(sweepCoverage(x, y, 40, 12, 0)).toBe(0);
        expect(sweepCoverage(x, y, 40, 12, 1)).toBe(1);
      }
    }
  });

  it('sweeps from top-left to bottom-right', () => {
    const avg = (x0, y0) => {
      let sum = 0;
      for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + 10; x++) sum += sweepCoverage(x, y, 40, 12, 0.45);
      return sum / 30;
    };
    expect(avg(0, 0)).toBeGreaterThan(avg(30, 9));
  });

  it('handles a single-cell grid without dividing by zero', () => {
    expect(sweepCoverage(0, 0, 1, 1, 1)).toBe(1);
  });

  it('cover ends solid, reveal ends empty, and both have the right shape', () => {
    const cover = wipeFrame(20, 4, 1, 'cover').split('\n');
    expect(cover).toHaveLength(4);
    cover.forEach((line) => expect(line).toBe(FULL.repeat(20)));
    expect(wipeFrame(20, 4, 0, 'reveal')).toBe(cover.join('\n')); // reveal starts where cover ended
    wipeFrame(20, 4, 1, 'reveal').split('\n').forEach((line) => expect(line).toBe(' '.repeat(20)));
    expect(wipeFrame(0, 4, 0.5)).toBe('');
  });
});

describe('getHashTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="projects"></section>
      <a id="ok" href="#projects">p</a>
      <a id="skip" href="#projects" data-no-transition>s</a>
      <a id="empty" href="#">e</a>
      <a id="missing" href="#nope">m</a>
      <a id="external" href="https://example.com">x</a>
      <a id="nested" href="#projects"><span id="inner">in</span></a>`;
  });

  const click = (id, init = {}) => ({
    defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
    target: document.getElementById(id), ...init,
  });

  it('accepts plain left clicks on in-page links, including on child elements', () => {
    expect(getHashTarget(click('ok'))).toEqual({ id: 'projects', target: document.getElementById('projects') });
    expect(getHashTarget(click('inner'))?.id).toBe('projects');
  });

  it('ignores modified clicks, other buttons and already-handled events', () => {
    ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].forEach((key) => {
      expect(getHashTarget(click('ok', { [key]: true }))).toBeNull();
    });
    expect(getHashTarget(click('ok', { button: 1 }))).toBeNull();
    expect(getHashTarget(click('ok', { defaultPrevented: true }))).toBeNull();
  });

  it('ignores opted-out, empty, unknown and external links, and non-elements', () => {
    ['skip', 'empty', 'missing', 'external'].forEach((id) => expect(getHashTarget(click(id))).toBeNull());
    expect(getHashTarget(click('ok', { target: document }))).toBeNull();
  });
});

describe('jumpTo', () => {
  it('scrolls instantly, records history and moves focus without scrolling again', () => {
    document.body.innerHTML = '<section id="about"></section>';
    const target = document.getElementById('about');
    target.scrollIntoView = vi.fn();
    const focus = vi.spyOn(target, 'focus');
    const push = vi.spyOn(window.history, 'pushState');

    jumpTo({ id: 'about', target });
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' });
    expect(window.location.hash).toBe('#about');
    expect(target).toHaveAttribute('tabindex', '-1');
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });

    jumpTo({ id: 'about', target }); // same hash: no duplicate history entry
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('keeps an existing tabindex', () => {
    document.body.innerHTML = '<section id="x" tabindex="0"></section>';
    const target = document.getElementById('x');
    target.scrollIntoView = vi.fn();
    jumpTo({ id: 'x', target });
    expect(target).toHaveAttribute('tabindex', '0');
  });
});

describe('PageTransition', () => {
  function setup({ reduced = false } = {}) {
    mockReducedMotion(reduced);
    const raf = mockAnimationFrame();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const utils = render(
      <>
        <PageTransition />
        <a href="#about">to about</a>
        <a href="#projects">to projects</a>
        <section id="about">About</section>
        <section id="projects">Projects</section>
      </>
    );
    const overlay = utils.container.querySelector('.page-transition');
    return { ...utils, raf, scroll, overlay };
  }

  it('is decorative and idle by default', () => {
    const { overlay } = setup();
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).not.toHaveClass('is-active');
  });

  it('covers, jumps while covered, then reveals and cleans up', () => {
    const { raf, scroll, overlay } = setup();
    const link = screen.getByText('to about');
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(false); // default jump was replaced by the transition
    expect(overlay).toHaveClass('is-active');

    raf.step(0);
    raf.step(90); // mid-cover
    const mid = Number(overlay.style.getPropertyValue('--wipe'));
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(scroll).not.toHaveBeenCalled(); // not before the screen is covered

    raf.step(180); // cover complete -> jump
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#about');
    expect(document.activeElement).toBe(document.getElementById('about'));

    raf.step(200); // reveal starts
    raf.step(200 + 300); // reveal complete
    expect(overlay).not.toHaveClass('is-active');
    expect(overlay.style.getPropertyValue('--wipe')).toBe('');
    expect(raf.pending()).toBe(0);
  });

  it('a second click interrupts the running transition', () => {
    const { raf, scroll } = setup();
    fireEvent.click(screen.getByText('to about'));
    raf.step(0);
    raf.step(50);
    fireEvent.click(screen.getByText('to projects'));
    expect(raf.pending()).toBe(1); // old loop cancelled, new one queued
    raf.step(1000);
    raf.step(1000 + 180);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#projects');
  });

  it('jumps instantly with reduced motion', () => {
    const { raf, scroll, overlay } = setup({ reduced: true });
    fireEvent.click(screen.getByText('to projects'));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(overlay).not.toHaveClass('is-active');
    expect(raf.pending()).toBe(0);
  });

  it('leaves other clicks alone and stops listening on unmount', () => {
    const { scroll, unmount } = setup();
    const outside = document.createElement('a');
    outside.href = '#about';
    document.body.appendChild(outside);
    expect(fireEvent.click(screen.getByText('About'))).toBe(true); // not a link
    unmount();
    expect(fireEvent.click(outside)).toBe(true);
    expect(scroll).not.toHaveBeenCalled();
    outside.remove();
  });
});

describe('Header active section', () => {
  it('marks the link for the section in the reading zone', () => {
    const io = mockIntersectionObserver();
    render(
      <>
        <Header />
        {['about', 'expertise', 'experience', 'projects', 'contact'].map((id) => <section key={id} id={id} />)}
      </>
    );
    const observer = io.instances[io.instances.length - 1];
    expect(observer.targets).toHaveLength(5);

    act(() => observer.callback([{ target: document.getElementById('projects'), isIntersecting: true }]));
    expect(screen.getByRole('link', { name: 'projects' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'about' })).not.toHaveAttribute('aria-current');

    act(() => observer.callback([
      { target: document.getElementById('projects'), isIntersecting: false },
      { target: document.getElementById('contact'), isIntersecting: true },
    ]));
    expect(screen.getByRole('link', { name: 'contact' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'projects' })).not.toHaveAttribute('aria-current');
  });

  it('staggers mobile menu items with a per-item index', () => {
    render(<Header />);
    const items = screen.getAllByRole('listitem');
    items.forEach((item, index) => expect(item.style.getPropertyValue('--i')).toBe(String(index)));
  });

  it('works without IntersectionObserver', () => {
    const original = window.IntersectionObserver;
    delete window.IntersectionObserver;
    try {
      render(<Header />);
      expect(screen.getByRole('link', { name: 'about' })).not.toHaveAttribute('aria-current');
    } finally {
      window.IntersectionObserver = original;
    }
  });
});

describe('Reduced-motion variants', () => {
  it('use a short opacity-only fade instead of a moving spring', () => {
    mockReducedMotion(false);
    expect(renderHook(() => useRiseVariants()).result.current).toBe(riseVariants);
    mockReducedMotion(true);
    expect(renderHook(() => useRiseVariants()).result.current).toBe(fadeVariants);
    expect(fadeVariants.hidden).not.toHaveProperty('y');
    expect(fadeVariants.visible.transition.duration).toBeLessThanOrEqual(0.2);
  });
});

describe('DrawRule', () => {
  it('is decorative and marked for the no-JS fallback', () => {
    mockReducedMotion(true);
    const { container } = renderWithMotion(<DrawRule />);
    const rule = container.querySelector('.ascii-rule');
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule).toHaveAttribute('data-reveal');
  });
});

describe('Weather readout crossfade', () => {
  it('remounts the reading when the status changes so it fades in', async () => {
    const city = { name: 'Taipei', latitude: 25, longitude: 121, timeZone: 'Asia/Taipei' };
    const { rerender } = render(<WeatherStatus city={city} weather={null} status="loading" localTime="--:--" />);
    const loading = screen.getByText('fetching…');
    expect(loading).toHaveClass('fade-in');
    rerender(<WeatherStatus city={city} weather={null} status="error" localTime="--:--" />);
    const offline = screen.getByText('weather offline');
    expect(offline).toHaveClass('fade-in');
    expect(offline).not.toBe(loading);
  });
});
