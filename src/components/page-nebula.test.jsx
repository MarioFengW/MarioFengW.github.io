import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import PageNebula, { sectionAtMiddle } from './PageNebula';
import useNebulaFocus from '../hooks/useNebulaFocus';
import {
  DEFAULT_FOCUS, getFocus, isPaused, registerSection, registeredSections, resetFocus,
  setActiveSection, setPaused, subscribe,
} from '../lib/nebulaFocus';
import { blendShapes, flag, heroGas, hub, matching, PROJECT_SHAPES, quietGas, retrieval, weatherGas } from '../lib/stages';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

afterEach(() => resetFocus());

describe('nebula focus store', () => {
  it('uses the active section focus, and the default otherwise', () => {
    const a = { key: 'a', shape: quietGas, label: 'A' };
    const off = registerSection('one', () => a);
    expect(getFocus()).toBe(DEFAULT_FOCUS);
    setActiveSection('one');
    expect(getFocus()).toBe(a);
    off();
    expect(getFocus()).toBe(DEFAULT_FOCUS);
  });

  it('notifies only when the focus key or the pause state changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    registerSection('one', () => ({ key: 'a', shape: quietGas, label: '' }));
    setActiveSection('one');
    setActiveSection('one');
    expect(listener).toHaveBeenCalledTimes(1);
    setPaused(true);
    setPaused(true);
    expect(isPaused()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    expect(registeredSections()).toEqual(['one']);
  });
});

describe('page shapes', () => {
  it('hero gas is dense on the right on wide screens, at the top on narrow ones', () => {
    expect(heroGas(200, 50)(190, 25)).toBeGreaterThan(heroGas(200, 50)(10, 25));
    expect(heroGas(50, 50)(25, 2)).toBeGreaterThan(heroGas(50, 50)(25, 45));
  });

  it('weather gas has a shape for every condition', () => {
    ['rain', 'thunder', 'snow', 'cloud', 'fog', 'wind', 'sun', 'night'].forEach((type) => {
      const shape = weatherGas(type)(80, 40, 1.3);
      const values = [];
      for (let x = 0; x < 80; x += 7) for (let y = 0; y < 40; y += 3) values.push(shape(x, y));
      values.forEach((v) => expect(Number.isFinite(v)).toBe(true));
    });
    expect(weatherGas('thunder')(80, 40, 0.05)(3, 3)).toBe(1.2); // the flash
  });

  it('project shapes draw something on and off their form', () => {
    const peak = (factory) => {
      const shape = factory(80, 40, 2);
      let max = 0;
      for (let x = 0; x < 80; x++) for (let y = 0; y < 40; y++) max = Math.max(max, shape(x, y));
      return max;
    };
    [retrieval, hub, matching, flag].forEach((factory) => expect(peak(factory)).toBeGreaterThan(1));
    expect(PROJECT_SHAPES).toHaveLength(4);
  });

  it('blendShapes cross-fades from one factory to the next', () => {
    const a = () => () => 0;
    const b = () => () => 1;
    expect(blendShapes(a, b, 10, 10, 0, 0)(1, 1)).toBe(0);
    expect(blendShapes(a, b, 10, 10, 0, 0.5)(1, 1)).toBeCloseTo(0.5);
    expect(blendShapes(null, b, 10, 10, 0, 0)(1, 1)).toBe(1);
  });
});

function Section({ id, focus }) {
  useNebulaFocus(id, focus);
  return <section id={id} />;
}

describe('PageNebula', () => {
  it('follows the section under the middle of the screen and shows its label', () => {
    mockReducedMotion(true);
    mockIntersectionObserver();
    mockAnimationFrame();
    vi.stubGlobal('innerHeight', 800);
    const { container } = render(
      <>
        <PageNebula />
        <Section id="first" focus={{ key: 'first', shape: quietGas, label: '[ first ] one' }} />
        <Section id="second" focus={{ key: 'second', shape: heroGas, label: '[ second ] two' }} />
      </>
    );
    const place = (id, top, bottom) => {
      document.getElementById(id).getBoundingClientRect = () => ({ top, bottom });
    };
    place('first', -900, 100);
    place('second', 100, 1200);
    expect(sectionAtMiddle(['first', 'second'], 400)).toBe('second');
    act(() => setActiveSection(sectionAtMiddle(registeredSections(), 400)));
    expect(container.querySelector('.nebula-hud').textContent).toContain('[ second ] two');
    expect(container.querySelector('.page-nebula')).toHaveAttribute('aria-hidden', 'true');
  });

  it('pauses when the hero asks it to', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    render(<PageNebula />);
    act(() => setPaused(true));
    expect(isPaused()).toBe(true);
    raf.step(16);
  });
});
