import { describe, expect, it } from 'vitest';
import { findWires, flowFrame, wireCells } from './flow';

describe('findWires', () => {
  it('reads direction from arrowheads', () => {
    const [fwd] = findWires(['a ---> b']);
    expect(fwd).toMatchObject({ axis: 'x', y: 0, x0: 2, x1: 4, dirs: [1] });
    const [both] = findWires(['a <--> b']);
    expect(both.dirs).toEqual([1, -1]);
    const [plain] = findWires(['a -- b']);
    expect(plain.dirs).toEqual([1]);
  });

  it('finds vertical runs of pipes', () => {
    const wires = findWires(['  |', '  |', '  x']);
    expect(wires).toContainEqual({ axis: 'y', x: 2, y0: 0, y1: 1, dirs: [1] });
  });

  it('ignores single dashes', () => {
    expect(findWires(['a - b'])).toEqual([]);
  });
});

describe('wireCells', () => {
  const wire = { axis: 'x', y: 0, x0: 0, x1: 9, dirs: [1] };

  it('moves the packet head forward over time', () => {
    const head = (t) => wireCells(wire, t).find((c) => c.part === 'head');
    const a = head(0);
    const b = head(1 / 9); // one cell later at 9 cells per second
    expect(b.x - a.x).toBe(1);
  });

  it('draws a trail behind the head', () => {
    const cells = wireCells(wire, 0.5);
    const head = cells.find((c) => c.part === 'head');
    const trail = cells.filter((c) => c.part === 'trail');
    trail.forEach((c) => expect(c.x).toBeLessThan(head.x));
  });

  it('runs backwards for reverse wires', () => {
    const back = { ...wire, dirs: [-1] };
    const head = (t) => wireCells(back, t).find((c) => c.part === 'head');
    expect(head(1 / 9).x - head(0).x).toBe(-1);
  });

  it('moves down vertical wires', () => {
    const v = { axis: 'y', x: 3, y0: 0, y1: 4, dirs: [1] };
    const cells = wireCells(v, 0);
    cells.forEach((c) => expect(c.x).toBe(3));
  });
});

describe('flowFrame', () => {
  it('blanks lit cells in the base and keeps all layers the same shape', () => {
    const lines = ['[a] ------> [b]'];
    const wires = findWires(lines);
    // First moment the packet is on the wire (it spends part of each cycle in the gap).
    let t = 0;
    while (!flowFrame(lines, wires, t).head.includes('*')) t += 0.05;
    const frame = flowFrame(lines, wires, t);
    expect(frame.head).toMatch(/\*/);
    const lit = frame.head.indexOf('*');
    expect(frame.base[lit]).toBe(' ');
    expect(frame.base.startsWith('[a]')).toBe(true);
  });
});
