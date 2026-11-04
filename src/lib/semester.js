// Pure semester maths for the "Now" section. Dates are ISO strings (YYYY-MM-DD).

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Where `date` falls in a semester of `weeks` weeks starting on `start`.
 * Weeks run Monday to Sunday from the start date; week 1 is the first.
 */
export function semesterProgress(date, start, weeks) {
  const startMs = Date.parse(`${start}T00:00:00`);
  const elapsedDays = Math.floor((date.getTime() - startMs) / DAY_MS);
  if (elapsedDays < 0) return { week: 0, progress: 0, status: 'upcoming' };
  const week = Math.floor(elapsedDays / 7) + 1;
  if (week > weeks) return { week: weeks, progress: 1, status: 'done' };
  return { week, progress: elapsedDays / (weeks * 7), status: 'running' };
}
