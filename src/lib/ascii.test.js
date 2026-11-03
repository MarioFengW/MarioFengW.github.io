import { describe, expect, it } from 'vitest';
import {
  RAMP,
  SCRAMBLE_GLYPHS,
  charForIntensity,
  clamp,
  gridSize,
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
