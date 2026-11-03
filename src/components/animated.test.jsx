import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import AsciiField from './AsciiField';
import ScrambleText from './ScrambleText';
import useReducedMotion from '../hooks/useReducedMotion';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';


afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useReducedMotion', () => {
  it('follows the media query and its changes', () => {
    const setReduced = mockReducedMotion(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
    act(() => setReduced(false));
    expect(result.current).toBe(false);
  });
});

describe('ScrambleText', () => {
  it('exposes the real text to assistive tech and hides the animated copy', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    render(<ScrambleText as="h2" text="Selected projects" />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Selected projects' });
    expect(heading.querySelector('[aria-hidden="true"]')).toHaveTextContent('Selected projects');
  });

  it('decodes once when scrolled into view and ends on the real text', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    render(<ScrambleText text="Experience" />);
    const visual = screen.getByText('Experience', { selector: '[aria-hidden="true"]' });

    io.trigger(false);
    expect(raf.pending()).toBe(0);

    io.trigger(true);
    raf.step(100); // mid-animation
    expect(visual.textContent).not.toBe('Experience');
    expect(visual.textContent).toHaveLength('Experience'.length);
    expect(visual.textContent.startsWith('E')).toBe(true);

    raf.step(120); // under STEP_MS: text not re-rolled, loop continues
    expect(raf.pending()).toBe(1);

    raf.step(800); // done
    expect(visual.textContent).toBe('Experience');
    expect(raf.pending()).toBe(0);

    io.trigger(true); // observer disconnected; does not replay
    expect(raf.pending()).toBe(0);
  });

  it('restores the text if unmounted mid-animation', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const { unmount } = render(<ScrambleText text="About" />);
    const visual = screen.getByText('About', { selector: '[aria-hidden="true"]' });
    io.trigger(true);
    raf.step(100);
    unmount();
    expect(visual.textContent).toBe('About');
    expect(raf.pending()).toBe(0);
  });

  it('does not animate with reduced motion', () => {
    mockReducedMotion(true);
    const io = mockIntersectionObserver();
    render(<ScrambleText text="Contact" />);
    expect(io.instances.every((o) => o.disconnected || o.targets.length === 0)).toBe(true);
  });
});

describe('AsciiField', () => {
  const rect = { left: 0, top: 0, right: 160, bottom: 60, width: 160, height: 60, x: 0, y: 0 };
  const FRAME = 1000 / 24;

  beforeEach(() => {
    // Box is 160x60; the 20-char probe measures 160px -> 8px per char; line height 15px.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect);
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const style = realGetComputedStyle(el);
      return { ...style, lineHeight: '15px' };
    });
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  // All four nebula layers together; line counts come from the first layer.
  const text = (container) => [...container.querySelectorAll('pre')].map((p) => p.textContent).join('\u0000');
  const lines = (container) => container.querySelector('pre').textContent.split('\n');

  it('fills its box with a decorative ASCII frame and animates', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { container } = render(<AsciiField className="hero-field" />);
    const wrap = container.firstChild;
    expect(wrap).toHaveAttribute('aria-hidden', 'true');
    expect(wrap).toHaveClass('ascii-field', 'hero-field');

    expect(lines(container)).toHaveLength(4); // 60 / 15
    expect(lines(container)[0]).toHaveLength(20); // 160 / 8
    const first = text(container);

    raf.step(10); // throttled: too soon after the last frame
    expect(text(container)).toBe(first);

    raf.step(5000);
    expect(text(container)).not.toBe(first);

    io.trigger(false); // offscreen: stop drawing
    const offscreen = text(container);
    raf.step(9000);
    expect(text(container)).toBe(offscreen);
  });

  it('bends the field toward the pointer and forgets it when it leaves', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { container } = render(<AsciiField />);

    raf.step(1000);
    raf.step(1000 + FRAME + 1);
    const withoutPointer = text(container);

    // Same timestamps again, but with the pointer in the middle of the box.
    const { container: other } = render(<AsciiField />);
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 80, clientY: 30 }));
    raf.step(1000);
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 90, clientY: 30 }));
    raf.step(1000 + FRAME + 1); // eased update toward the new target
    expect(text(other)).not.toBe(withoutPointer);

    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 999, clientY: 999 }));
    raf.step(5000);
    expect(lines(other)).toHaveLength(4);
  });

  it('re-measures on resize and cleans up on unmount', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { container, unmount } = render(<AsciiField />);
    window.dispatchEvent(new Event('resize'));
    expect(lines(container)).toHaveLength(4);
    unmount();
    expect(raf.pending()).toBe(0);
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('works without IntersectionObserver support', () => {
    mockReducedMotion(false);
    const original = window.IntersectionObserver;
    delete window.IntersectionObserver;
    try {
      const raf = mockAnimationFrame();
      const { container } = render(<AsciiField />);
      raf.step(5000);
      expect(lines(container)).toHaveLength(4);
    } finally {
      window.IntersectionObserver = original;
    }
  });

  it('renders one static frame and no loop while paused', () => {
    const raf = mockAnimationFrame();
    const { container, unmount } = render(<AsciiField playing={false} />);
    expect(lines(container)).toHaveLength(4);
    expect(raf.pending()).toBe(0);
    window.dispatchEvent(new Event('resize'));
    expect(lines(container)).toHaveLength(4);
    unmount();
  });

  it('pausing freezes the current frame and resuming continues from it', () => {
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { container, rerender } = render(<AsciiField playing />);
    raf.step(3000); // t = 3s
    const atPause = text(container);

    performance.now.mockReturnValue(9000);
    rerender(<AsciiField playing={false} />);
    expect(text(container)).toBe(atPause); // frozen, not reset to t=0
    expect(raf.pending()).toBe(0);

    rerender(<AsciiField playing />);
    expect(text(container)).toBe(atPause); // resumes from the same moment
    raf.step(9000 + 2000);
    expect(text(container)).not.toBe(atPause);
  });

  it('re-measures when its box resizes and after web fonts load', async () => {
    let resizeCallback;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb) { resizeCallback = cb; }
      observe(...args) { observe(...args); }
      disconnect() { disconnect(); }
    });
    let resolveFonts;
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise((resolve) => { resolveFonts = resolve; }) },
    });
    mockAnimationFrame();
    try {
      const { container, unmount } = render(<AsciiField playing={false} />);
      expect(observe).toHaveBeenCalledWith(container.firstChild);
      expect(lines(container)).toHaveLength(4);

      Element.prototype.getBoundingClientRect.mockReturnValue({ ...rect, height: 90, bottom: 90 });
      resizeCallback();
      expect(lines(container)).toHaveLength(6); // 90 / 15

      Element.prototype.getBoundingClientRect.mockReturnValue({ ...rect, height: 30, bottom: 30 });
      await act(async () => resolveFonts());
      expect(lines(container)).toHaveLength(2);

      unmount();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete document.fonts;
    }
  });
});
