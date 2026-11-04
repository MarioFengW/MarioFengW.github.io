import { describe, expect, it } from 'vitest';
import { routeLines } from './routes';
import { findWires } from './flow';

describe('routeLines', () => {
  it('puts channel i on line 2i with connectors between', () => {
    const lines = routeLines(3);
    expect(lines).toHaveLength(5);
    expect(lines[0].startsWith('[ you ]')).toBe(true);
    [0, 2, 4].forEach((i) => expect(lines[i].trimEnd().endsWith('>')).toBe(true));
    [1, 3].forEach((i) => expect(lines[i].trim()).toBe('|'));
  });

  it('is empty without channels', () => {
    expect(routeLines(0)).toEqual([]);
  });

  it('gives packets a wire on every arm and connector', () => {
    const wires = findWires(routeLines(3));
    expect(wires.filter((w) => w.axis === 'x').length).toBeGreaterThanOrEqual(3);
    expect(wires.filter((w) => w.axis === 'y')).toHaveLength(2);
  });
});
