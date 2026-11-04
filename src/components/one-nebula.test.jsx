import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import Experience from './Experience';
import { broadcast, detection, EXPERIENCE_SHAPES, FRUIT, scanning, streams } from '../lib/stages';
import { fieldOffset, GAS_PARALLAX } from '../hooks/useAsciiLoop';
import { mockIntersectionObserver, mockReducedMotion } from '../test/browser';
import { getFocus, resetFocus, setActiveSection } from '../lib/nebulaFocus';

describe('experience shapes', () => {
  it('streams are three lanes on the left and one merged lane on the right', () => {
    const shape = streams(100, 40, 0.13); // pulse near its peak at x = 0
    expect(shape(0, Math.round(40 * 0.22))).toBeGreaterThan(shape(0, Math.round(40 * 0.36)));
    expect(shape(90, 20)).toBeGreaterThan(shape(90, 4));
  });

  it('broadcast is bright at the source and between rings it thins out', () => {
    const shape = broadcast(100, 40, 0);
    expect(shape(32, 20)).toBeGreaterThan(1);
  });

  it('detection boxes one fruit at a time, in turn', () => {
    expect(scanning(0)).toBe(0);
    expect(scanning(1.2)).toBe(1);
    const shape = detection(100, 40, 0);
    const [fx, fy] = FRUIT[0];
    expect(shape(fx * 100, fy * 40)).toBeGreaterThan(1);
  });

  it('has one shape per experience entry', async () => {
    const { experience } = await import('../data/content');
    expect(EXPERIENCE_SHAPES).toHaveLength(experience.length);
    experience.forEach((item) => expect(item.shape).toBeTruthy());
  });
});

describe('fieldOffset', () => {
  it('places a field in the page-wide gas by screen position plus slowed scroll', () => {
    vi.stubGlobal('scrollY', 1000);
    const wrap = { getBoundingClientRect: () => ({ top: 150 }) };
    expect(fieldOffset(wrap, 15)).toBe(Math.round((150 + 1000 * GAS_PARALLAX) / 15));
    expect(fieldOffset(null, 15)).toBe(0);
    expect(fieldOffset(wrap, 0)).toBe(0);
  });
});

describe('Experience nebula focus', () => {
  it('follows the hovered entry on fine pointers, then falls back to the open one', () => {
    mockReducedMotion(true);
    mockIntersectionObserver();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    resetFocus();
    const { container } = render(<Experience />);
    setActiveSection('experience');
    const caption = () => getFocus().label;
    expect(caption()).toContain('itesm');
    const items = container.querySelectorAll('.exp-item');
    act(() => {
      fireEvent.pointerEnter(items[1]);
    });
    expect(caption()).toContain('amco');
    act(() => {
      fireEvent.pointerLeave(items[1]);
    });
    expect(caption()).toContain('itesm');
  });
});
