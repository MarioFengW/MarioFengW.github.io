import { describe, expect, it } from 'vitest';
import { nebulaBar } from './nebulaBar';

describe('nebulaBar', () => {
  it('fills with gas that thickens toward a bright head, the rest is sky', () => {
    const bar = nebulaBar(0.5, 10);
    expect(bar.head).toBe('@');
    expect((bar.dust + bar.gas + bar.head).length).toBe(5);
    expect(bar.sky).toBe('     ');
    expect(bar.percent).toBe(' 50%');
    expect(bar.gas.at(-1)).toBe('#');
  });

  it('is empty at 0 and full at 1, and clamps bad input', () => {
    expect(nebulaBar(0, 8)).toMatchObject({ head: '', sky: '        ', percent: '  0%' });
    expect(nebulaBar(1, 8).sky).toBe('');
    expect(nebulaBar(NaN, 4).percent).toBe('  0%');
    expect(nebulaBar(2, 4).percent).toBe('100%');
    expect(nebulaBar(1 / 8, 8)).toMatchObject({ dust: '', gas: '', head: '@' });
  });
});
