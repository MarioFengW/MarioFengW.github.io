import { describe, expect, it } from 'vitest';
import { clearingMask, toCells, withClearings } from './clearings';

describe('clearings', () => {
  it('converts screen rects to padded cell rects and drops off-screen ones', () => {
    const cells = toCells(
      [{ left: 100, right: 200, top: 150, bottom: 300 }, { left: 0, right: 50, top: -900, bottom: -800 }],
      10, 15, 100, 40
    );
    expect(cells).toHaveLength(1);
    expect(cells[0]).toEqual({ x0: 8, x1: 22, y0: 9, y1: 21 });
    expect(toCells([{ left: 0, right: 1, top: 0, bottom: 1 }], 0, 15, 10, 10)).toEqual([]);
  });

  it('is closed inside a clearing and open well outside it', () => {
    const mask = clearingMask([{ x0: 10, x1: 20, y0: 10, y1: 20 }]);
    expect(mask(15, 15)).toBe(0);
    expect(mask(60, 15)).toBe(1);
    const edge = mask(22, 15);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(1);
  });

  it('cuts the clearings out of a shape, and does nothing without any', () => {
    const shape = () => 1.2;
    expect(clearingMask([])).toBeNull();
    expect(withClearings(shape, null)).toBe(shape);
    const cut = withClearings(shape, clearingMask([{ x0: 0, x1: 5, y0: 0, y1: 5 }]));
    expect(cut(2, 2)).toBe(0);
    expect(cut(40, 30)).toBeCloseTo(1.2);
  });
});
