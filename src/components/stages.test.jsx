import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import Expertise from './Expertise';
import AsciiFlow from './AsciiFlow';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

function placeSteps(container, centers) {
  container.querySelectorAll('.stage-step').forEach((step, index) => {
    step.getBoundingClientRect = () => ({ top: centers[index] - 100, height: 200 });
  });
}

describe('Expertise stage', () => {
  it('activates the step closest to the middle of the screen', () => {
    mockReducedMotion(true);
    const io = mockIntersectionObserver();
    const { container } = render(<Expertise />);
    const steps = container.querySelectorAll('.stage-step');
    expect(steps[0]).toHaveClass('is-active');

    vi.stubGlobal('innerHeight', 800);
    placeSteps(container, [-500, 120, 410]); // third step sits on the middle (400)
    act(() => io.trigger(true));
    expect(steps[2]).toHaveClass('is-active');
    expect(container.querySelector('.stage-caption').textContent).toContain('deploy');
    expect(container.querySelector('.stage-wire .is-active').textContent).toBe('[ deploy ]');
  });
});

describe('AsciiFlow', () => {
  const lines = ['[a] -------> [b]'];

  it('is a still drawing with reduced motion', () => {
    mockReducedMotion(true);
    const { container } = render(<AsciiFlow lines={lines} />);
    expect(container.querySelector('.ascii-flow-base').textContent).toBe(lines[0]);
    expect(container.querySelector('.ascii-flow-head').textContent).toBe('');
  });

  it('animates packets only while on screen, and restores the drawing on unmount', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { container, unmount } = render(<AsciiFlow lines={lines} />);
    const head = container.querySelector('.ascii-flow-head');

    raf.step(500);
    expect(head.textContent).toBe(''); // offscreen: nothing painted

    io.trigger(true);
    let painted = false;
    for (let t = 600; t < 3000 && !painted; t += 100) {
      now = t;
      raf.step(t);
      painted = head.textContent.includes('*');
    }
    expect(painted).toBe(true);

    const base = container.querySelector('.ascii-flow-base');
    unmount();
    expect(base.textContent).toBe(lines[0]);
    expect(raf.pending()).toBe(0);
  });
});
