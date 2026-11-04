import { describe, expect, it } from 'vitest';
import { semesterProgress } from './semester';

const START = '2026-09-07';

describe('semesterProgress', () => {
  it('is upcoming before the first day', () => {
    expect(semesterProgress(new Date('2026-09-01T12:00:00'), START, 16)).toEqual({ week: 0, progress: 0, status: 'upcoming' });
  });

  it('counts Monday-to-Sunday weeks from the start date', () => {
    expect(semesterProgress(new Date('2026-09-07T09:00:00'), START, 16).week).toBe(1);
    expect(semesterProgress(new Date('2026-09-13T23:00:00'), START, 16).week).toBe(1);
    expect(semesterProgress(new Date('2026-09-14T00:30:00'), START, 16).week).toBe(2);
    expect(semesterProgress(new Date('2026-11-04T12:00:00'), START, 16).week).toBe(9);
  });

  it('reports progress as a fraction of the whole term', () => {
    const { progress, status } = semesterProgress(new Date('2026-10-26T12:00:00'), START, 16);
    expect(status).toBe('running');
    expect(progress).toBeCloseTo(49 / 112, 5);
  });

  it('is done after the last week', () => {
    expect(semesterProgress(new Date('2027-01-15T12:00:00'), START, 16)).toEqual({ week: 16, progress: 1, status: 'done' });
  });
});
