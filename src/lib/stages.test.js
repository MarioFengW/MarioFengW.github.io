import { describe, expect, it } from 'vitest';
import { clusters, containers, containersUp, GRID, layers, stageShape } from './stages';
import { renderNebulaLayers } from './nebula';

describe('stage shapes', () => {
  it('clusters are dense at a cluster centre and thin far from all of them', () => {
    const shape = clusters(80, 40, 0);
    // t = 0: first centre sits at (0.76 * cols, 0.5 * rows).
    expect(shape(Math.round(80 * 0.76), 20)).toBeGreaterThan(1.2);
    expect(shape(0, 0)).toBeLessThan(0.3);
  });

  it('layers are dense on the three bands and thin between them', () => {
    const shape = layers(80, 40, 0);
    expect(shape(10, 8)).toBeGreaterThan(1);
    expect(shape(10, 14)).toBeLessThan(0.5);
  });

  it('containers come up one by one and recycle', () => {
    expect(containersUp(0)).toBe(0);
    expect(containersUp(1)).toBe(1);
    expect(containersUp(5.5)).toBe(GRID.cols * GRID.rows);
    expect(containersUp(8 / 1.1)).toBe(0);
  });

  it('a lit container is brighter inside than an idle one', () => {
    const lit = containers(90, 40, 3)(15, 10); // container 0, up at t = 3
    const idle = containers(90, 40, 0)(15, 10);
    expect(lit).toBeGreaterThan(idle);
  });

  it('cross-fades between two shapes', () => {
    const from = clusters(80, 40, 0)(5, 5);
    const to = layers(80, 40, 0)(5, 5);
    expect(stageShape(80, 40, 0, 1, 0, 0)(5, 5)).toBeCloseTo(from);
    expect(stageShape(80, 40, 0, 1, 0, 1)(5, 5)).toBeCloseTo(to);
    const mid = stageShape(80, 40, 0, 1, 0, 0.5)(5, 5);
    expect(mid).toBeCloseTo((from + to) / 2);
  });

  it('a zero shape empties the nebula except for stars', () => {
    const frames = renderNebulaLayers(40, 20, 1, null, () => 0);
    expect(frames.slice(0, 3).join('').trim()).toBe('');
  });
});
