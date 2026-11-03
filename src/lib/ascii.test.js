import { describe, expect, it } from 'vitest';
import {
  RAMP,
  SCRAMBLE_GLYPHS,
  charForIntensity,
  clamp,
  contourIntensity,
  fieldHeight,
  gridSize,
  renderTopoFrame,
  scrambleText,
} from './ascii';

describe('clamp', () => {
  it('limits values to the range', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });
});

describe('charForIntensity', () => {
  it('maps the ends of the range to the ends of the ramp', () => {
    expect(charForIntensity(0)).toBe(' ');
    expect(charForIntensity(1)).toBe(RAMP[RAMP.length - 1]);
  });

  it('clamps out-of-range intensities instead of returning undefined', () => {
    expect(charForIntensity(-5)).toBe(' ');
    expect(charForIntensity(42)).toBe(RAMP[RAMP.length - 1]);
  });

  it('supports a custom ramp', () => {
    expect(charForIntensity(0.5, 'ab')).toBe('b');
  });
});

describe('fieldHeight', () => {
  it('stays within 0..1 without a pointer', () => {
    for (let i = 0; i < 200; i++) {
      const h = fieldHeight(i * 3.1, i * 1.7, i * 0.13);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
  });

  it('raises the field directly under the pointer', () => {
    const base = fieldHeight(20, 10, 1);
    const lifted = fieldHeight(20, 10, 1, { x: 20, y: 10 });
    expect(lifted - base).toBeCloseTo(0.35, 5);
  });

  it('has negligible pointer influence far away', () => {
    const base = fieldHeight(0, 0, 1);
    const far = fieldHeight(0, 0, 1, { x: 400, y: 400 });
    expect(far - base).toBeLessThan(1e-6);
  });
});

describe('contourIntensity', () => {
  it('is brightest exactly on a contour line', () => {
    expect(contourIntensity(1 / 7)).toBeCloseTo(1, 10);
  });

  it('is zero halfway between lines', () => {
    expect(contourIntensity(1.5 / 7)).toBe(0);
  });
});

describe('renderTopoFrame', () => {
  it('returns rows x cols characters', () => {
    const lines = renderTopoFrame(30, 8, 0).split('\n');
    expect(lines).toHaveLength(8);
    lines.forEach((line) => expect(line).toHaveLength(30));
  });

  it('only uses ramp characters', () => {
    const frame = renderTopoFrame(40, 10, 2.5, { x: 10, y: 4 }).replace(/\n/g, '');
    for (const ch of frame) expect(RAMP).toContain(ch);
  });

  it('draws visible contour lines', () => {
    expect(renderTopoFrame(80, 20, 0).trim().length).toBeGreaterThan(0);
  });

  it('is deterministic for the same inputs and animates over time', () => {
    expect(renderTopoFrame(20, 5, 1)).toBe(renderTopoFrame(20, 5, 1));
    expect(renderTopoFrame(60, 20, 0)).not.toBe(renderTopoFrame(60, 20, 3));
  });

  it('returns an empty string for an empty grid', () => {
    expect(renderTopoFrame(0, 10, 0)).toBe('');
    expect(renderTopoFrame(10, 0, 0)).toBe('');
  });
});

describe('scrambleText', () => {
  const fixedRandom = () => 0;
  const g = SCRAMBLE_GLYPHS[0];

  it('returns the target when progress is complete', () => {
    expect(scrambleText('Projects', 1, fixedRandom)).toBe('Projects');
  });

  it('scrambles everything except spaces at zero progress', () => {
    expect(scrambleText('ab cd', 0, fixedRandom)).toBe(`${g}${g} ${g}${g}`);
  });

  it('resolves characters left to right', () => {
    const out = scrambleText('abcd', 0.5, fixedRandom);
    expect(out).toBe(`ab${g}${g}`);
  });

  it('keeps the same length', () => {
    expect(scrambleText('Selected projects', 0.3)).toHaveLength('Selected projects'.length);
  });

  it('never indexes past the glyph pool even if random returns 1', () => {
    expect(scrambleText('x', 0, () => 1, 'ab')).toBe('a');
  });

  it('only uses glyphs the Pixelta display font contains', () => {
    // Characters verified missing from src/assets/fonts/Pixelta.ttf.
    for (const missing of `"$'\\^{|}~`) expect(SCRAMBLE_GLYPHS).not.toContain(missing);
  });
});

describe('gridSize', () => {
  it('covers the box fully', () => {
    expect(gridSize(100, 30, 8, 15)).toEqual({ cols: 13, rows: 2 });
  });

  it('returns an empty grid when metrics are unavailable', () => {
    expect(gridSize(100, 30, 0, 15)).toEqual({ cols: 0, rows: 0 });
    expect(gridSize(100, 30, 8, NaN)).toEqual({ cols: 0, rows: 0 });
  });
});
