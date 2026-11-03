import { describe, expect, it } from 'vitest';
import {
  NEBULA_LAYERS,
  classifyCell,
  fbm,
  lattice,
  nebulaSample,
  renderNebulaLayers,
  smoothstep,
  valueNoise,
} from './nebula';
import { WEATHER_SCENES, isFlash, renderWeatherField } from './weatherField';

describe('noise primitives', () => {
  it('lattice values are deterministic, in 0..1, and wrap every 256 cells', () => {
    expect(lattice(3, 9)).toBe(lattice(3, 9));
    expect(lattice(3, 9)).toBe(lattice(3 + 256, 9 - 256));
    for (let i = 0; i < 200; i++) {
      const v = lattice(i * 7, i * 13);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('valueNoise hits lattice values on integer points and is continuous between them', () => {
    expect(valueNoise(4, 5)).toBeCloseTo(lattice(4, 5), 6);
    expect(Math.abs(valueNoise(4.999, 5) - valueNoise(5, 5))).toBeLessThan(0.01);
  });

  it('fbm stays within 0..1', () => {
    for (let i = 0; i < 300; i++) {
      const v = fbm(i * 0.37, i * 0.11, 4);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('smoothstep clamps and eases', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 0.25)).toBeLessThan(0.25);
  });
});

describe('nebulaSample', () => {
  it('returns density, hue and star brightness', () => {
    const s = nebulaSample(10, 5, 1);
    expect(s).toEqual({ density: expect.any(Number), hue: expect.any(Number), star: expect.any(Number) });
    expect(s.hue).toBeGreaterThanOrEqual(0);
    expect(s.hue).toBeLessThanOrEqual(1);
  });

  it('the pointer brightens the gas right under it', () => {
    let brighter = 0;
    for (let x = 0; x < 40; x++) {
      const without = nebulaSample(x, 10, 2).density;
      const withPointer = nebulaSample(x, 10, 2, { x, y: 10 }).density;
      if (withPointer > without) brighter += 1;
    }
    expect(brighter).toBeGreaterThan(30);
  });
});

describe('classifyCell', () => {
  it('maps empty space, stars, dust, gas and core to the right layer', () => {
    expect(classifyCell({ density: 0.01, hue: 0.5, star: 0 })).toBeNull();
    expect(classifyCell({ density: 0, hue: 0.5, star: 0.9 })).toEqual({ layer: 3, char: '*' });
    expect(classifyCell({ density: 0, hue: 0.5, star: 0.1 })).toEqual({ layer: 3, char: '.' });
    expect(classifyCell({ density: 0.2, hue: 0.9, star: 0 }).layer).toBe(0);
    expect(classifyCell({ density: 0.6, hue: 0.2, star: 0 }).layer).toBe(1);
    expect(classifyCell({ density: 0.6, hue: 0.8, star: 0 }).layer).toBe(2);
    expect(classifyCell({ density: 0.95, hue: 0.2, star: 0 }).layer).toBe(3);
    expect(classifyCell({ density: 1.3, hue: 0.2, star: 0 }).char).toBe('@'); // glow clamps to the ramp
  });

  it('starts drawing faint dust right above the empty threshold', () => {
    expect(classifyCell({ density: 0.059, hue: 0.5, star: 0 })).toBeNull();
    expect(classifyCell({ density: 0.07, hue: 0.5, star: 0 })).toEqual({ layer: 0, char: '.' });
  });
});

describe('renderNebulaLayers', () => {
  const frame = renderNebulaLayers(80, 24, 3);

  it('returns one equally-sized string per layer', () => {
    expect(frame).toHaveLength(NEBULA_LAYERS.length);
    frame.forEach((layer) => {
      const lines = layer.split('\n');
      expect(lines).toHaveLength(24);
      lines.forEach((line) => expect(line).toHaveLength(80));
    });
  });

  it('never puts two glyphs in the same cell', () => {
    for (let i = 0; i < frame[0].length; i++) {
      const filled = frame.filter((layer) => layer[i] !== ' ' && layer[i] !== '\n').length;
      expect(filled).toBeLessThanOrEqual(1);
    }
  });

  it('uses every layer and drifts over time', () => {
    const big = renderNebulaLayers(160, 50, 3);
    big.forEach((layer) => expect(layer.trim().length).toBeGreaterThan(0));
    expect(renderNebulaLayers(80, 24, 3)).toEqual(frame);
    expect(renderNebulaLayers(80, 24, 9)).not.toEqual(frame);
  });

  it('returns empty layers for an empty grid', () => {
    expect(renderNebulaLayers(0, 10, 1)).toEqual(['', '', '', '']);
  });
});

describe('renderWeatherField', () => {
  it.each(WEATHER_SCENES)('%s: right size, has glyphs, animates', (type) => {
    const a = renderWeatherField(type, 90, 30, 2);
    const lines = a.text.split('\n');
    expect(lines).toHaveLength(30);
    lines.forEach((line) => expect(line).toHaveLength(90));
    expect(a.text.replace(/\s/g, '').length).toBeGreaterThan(0);
    expect(renderWeatherField(type, 90, 30, 2).text).toBe(a.text); // deterministic
    expect(renderWeatherField(type, 90, 30, 4.7).text).not.toBe(a.text);
  });

  it('rain falls: drops are drawn and move between frames', () => {
    const rows = renderWeatherField('rain', 60, 30, 1).text.split('\n');
    expect(rows.some((row) => row.includes('/'))).toBe(true);
    expect(renderWeatherField('rain', 60, 30, 1).text).not.toBe(renderWeatherField('rain', 60, 30, 1.05).text);
  });

  it('storms are heavier than rain and flash periodically', () => {
    const count = (s) => s.replace(/[^/]/g, '').length;
    expect(count(renderWeatherField('thunder', 120, 40, 3).text)).toBeGreaterThan(count(renderWeatherField('rain', 120, 40, 3).text));
    expect(renderWeatherField('thunder', 20, 5, 6.04).flash).toBe(true);
    expect(renderWeatherField('thunder', 20, 5, 3).flash).toBe(false);
    expect(renderWeatherField('rain', 20, 5, 6.04).flash).toBe(false);
  });

  it('isFlash fires twice at the start of every 6s cycle', () => {
    expect(isFlash(0.02)).toBe(true);
    expect(isFlash(0.12)).toBe(false);
    expect(isFlash(0.2)).toBe(true);
    expect(isFlash(3)).toBe(false);
    expect(isFlash(12.05)).toBe(true);
  });

  it('falls back to clouds for unknown types and handles an empty grid', () => {
    expect(renderWeatherField('volcano', 40, 12, 1).text).toBe(renderWeatherField('cloud', 40, 12, 1).text);
    expect(renderWeatherField('rain', 0, 12, 1)).toEqual({ text: '', flash: false });
  });
});
