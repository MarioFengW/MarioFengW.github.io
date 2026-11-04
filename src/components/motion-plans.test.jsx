import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AsciiFlow from './AsciiFlow';
import Footer from './Footer';
import Experience from './Experience';
import ScrambleText from './ScrambleText';
import { burstCells, findWires, flowFrame, FLOW_RATE } from '../lib/flow';
import { routeLines, routePath } from '../lib/routes';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

describe('burstCells', () => {
  const path = [0, 1, 2, 3, 4].map((x) => ({ x, y: 0 }));

  it('moves one cell per 1 / FLOW_RATE seconds from t0', () => {
    expect(burstCells(path, 2, 2).find((c) => c.part === 'head').x).toBe(0);
    expect(burstCells(path, 2 + 3.5 / FLOW_RATE, 2).find((c) => c.part === 'head').x).toBe(3);
  });

  it('is empty before it leaves and after its trail has passed the end', () => {
    expect(burstCells(path, 1, 2)).toEqual([]);
    expect(burstCells(path, 2 + 10 / FLOW_RATE, 2)).toEqual([]);
  });

  it('is drawn by flowFrame on top of the wires', () => {
    const lines = ['-----'];
    const frame = flowFrame(lines, [], 2 + 2 / FLOW_RATE, [{ path, t0: 2 }]);
    expect(frame.head[2]).toBe('*');
    expect(frame.base[2]).toBe(' ');
  });
});

describe('routePath', () => {
  it('runs from the junction down to the channel row, then along its arm', () => {
    const lines = routeLines(3);
    const jx = lines[0].indexOf('+');
    const path = routePath(lines, 2);
    expect(path[0]).toEqual({ x: jx, y: 0 });
    expect(path[4]).toEqual({ x: jx, y: 4 });
    const end = path[path.length - 1];
    expect(end.y).toBe(4);
    expect(lines[4][end.x]).toBe('-');
    expect(lines[4][end.x + 1]).toBe('>');
  });

  it('is empty for a channel that does not exist', () => {
    expect(routePath(routeLines(2), 5)).toEqual([]);
  });
});

function runFlow(fast) {
  mockReducedMotion(false);
  const io = mockIntersectionObserver();
  const raf = mockAnimationFrame();
  const lines = ['[a] ' + '-'.repeat(40) + '> [b]'];
  const { container, unmount } = render(<AsciiFlow lines={lines} fast={fast} />);
  io.trigger(true);
  const head = container.querySelector('.ascii-flow-head');
  const at = () => head.textContent.indexOf('*');
  // Advance one second of real time in 10 ms ticks.
  for (let t = 0; t <= 1000; t += 10) raf.step(t);
  const positions = [];
  for (let t = 1010; t <= 1300; t += 10) {
    raf.step(t);
    positions.push(at());
  }
  unmount();
  return positions.filter((x) => x >= 0);
}

describe('AsciiFlow speed', () => {
  it('moves one cell per painted frame, twice as often when fast', () => {
    const slow = runFlow(false);
    const quick = runFlow(true);
    const steps = (p) => p.slice(1).map((x, i) => x - p[i]).filter((d) => d !== 0);
    steps(slow).forEach((d) => expect(Math.abs(d)).toBeLessThanOrEqual(1));
    expect(new Set(quick).size).toBeGreaterThan(new Set(slow).size);
  });
});

describe('Contact bursts', () => {
  it('focusing a channel sends a packet down its wire', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { container } = render(<Footer />);
    io.trigger(true);
    raf.step(0);
    act(() => {
      fireEvent.focus(screen.getByRole('link', { name: /github/ }));
    });
    let seen = false;
    for (let t = 100; t < 1500 && !seen; t += 100) {
      raf.step(t);
      const rows = container.querySelector('.contact-wires .ascii-flow-head').textContent.split('\n');
      seen = rows.slice(1, 3).some((row) => row.includes('*'));
    }
    expect(seen).toBe(true);
  });

  it('sends nothing with reduced motion', () => {
    mockReducedMotion(true);
    const { container } = render(<Footer />);
    fireEvent.focus(screen.getByRole('link', { name: /github/ }));
    expect(container.querySelector('.contact-wires .ascii-flow-head').textContent).toBe('');
  });
});

describe('Experience packet', () => {
  it('rides the tip of the line and pings a milestone once when reached', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    vi.stubGlobal('innerHeight', 800);
    const { container } = render(<Experience />);
    const timeline = container.querySelector('.exp-timeline');
    const nodes = [...container.querySelectorAll('.exp-node')];
    let top = 900;
    timeline.getBoundingClientRect = () => ({ top, height: 600 });
    nodes.forEach((node, i) => {
      node.getBoundingClientRect = () => ({ top: top + 100 + i * 200, height: 10 });
    });

    act(() => {
      io.trigger(true);
      raf.step(16);
    });
    expect(nodes[0]).not.toHaveClass('is-ping');

    top = 200;
    act(() => {
      fireEvent.scroll(window);
      raf.step(32);
    });
    const packet = container.querySelector('.exp-packet');
    expect(packet.style.transform).toMatch(/translateY\(/);
    expect(nodes[0]).toHaveClass('is-ping');
  });
});

describe('ScrambleText immediate', () => {
  it('decodes on mount without waiting to be seen', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    render(<ScrambleText text="[ app ] ui" immediate />);
    const visual = screen.getAllByText((_, el) => el?.getAttribute('aria-hidden') === 'true')[0];
    now = 100;
    raf.step(100);
    expect(visual.textContent).not.toBe('[ app ] ui');
    now = 800;
    raf.step(800);
    expect(visual.textContent).toBe('[ app ] ui');
  });
});
