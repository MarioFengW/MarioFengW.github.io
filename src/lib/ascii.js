// Pure ASCII rendering helpers. No DOM access here so everything is unit-testable.

// Light-to-dark density ramp. Index 0 is "empty".
export const RAMP = ' .,:;-=+*#%@';

// Glyph pool used by the text scramble effect. Limited to characters the
// Pixelta display font contains, so headings don't flicker between fonts.
export const SCRAMBLE_GLYPHS = '!<>-_/[]=+*?#%@&01';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Map a 0..1 intensity to a character from the ramp. */
export function charForIntensity(intensity, ramp = RAMP) {
  const index = Math.round(clamp(intensity, 0, 1) * (ramp.length - 1));
  return ramp[index];
}

/**
 * Text scramble: characters before `progress * length` are resolved, the rest
 * are random glyphs. Spaces are always preserved so word shapes stay stable.
 */
export function scrambleText(target, progress, random = Math.random, glyphs = SCRAMBLE_GLYPHS) {
  const resolved = Math.floor(clamp(progress, 0, 1) * target.length);
  let out = '';
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    if (i < resolved || ch === ' ') out += ch;
    else out += glyphs[Math.floor(random() * glyphs.length) % glyphs.length];
  }
  return out;
}

/** Deterministic 0..1 pseudo-random value per cell (stable across frames). */
export function cellNoise(x, y, seed = 1) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return v - Math.floor(v);
}

const SWEEP_SPREAD = 0.65; // share of the timeline the diagonal sweep takes
const SWEEP_JITTER = 0.2; // per-cell randomness so the edge looks like noise, not a line
const SWEEP_SOFTNESS = 0.15; // how long one cell takes to go from blank to solid

/**
 * Coverage (0..1) of one cell at `progress` (0..1) of a diagonal ASCII wipe that
 * starts top-left and ends bottom-right. Reaches exactly 1 everywhere at progress 1.
 */
export function sweepCoverage(x, y, cols, rows, progress, seed = 1) {
  const diagonal = ((cols > 1 ? x / (cols - 1) : 0) + (rows > 1 ? y / (rows - 1) : 0)) / 2;
  const start = diagonal * SWEEP_SPREAD + cellNoise(x, y, seed) * SWEEP_JITTER;
  return clamp((progress - start) / SWEEP_SOFTNESS, 0, 1);
}

/**
 * One frame of the section transition. `phase` 'cover' fills the screen with
 * glyphs; 'reveal' clears them in the same diagonal order.
 */
export function wipeFrame(cols, rows, progress, phase = 'cover', seed = 1, ramp = RAMP) {
  if (cols <= 0 || rows <= 0) return '';
  const lines = new Array(rows);
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const covered = sweepCoverage(x, y, cols, rows, progress, seed);
      line += charForIntensity(phase === 'cover' ? covered : 1 - covered, ramp);
    }
    lines[y] = line;
  }
  return lines.join('\n');
}

/** `[####......]  40%` style progress bar. Non-finite input counts as 0. */
export function asciiProgress(progress, width = 16) {
  const p = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
  const filled = Math.round(p * width);
  const percent = String(Math.round(p * 100)).padStart(3, ' ');
  return `[${'#'.repeat(filled)}${'.'.repeat(width - filled)}] ${percent}%`;
}

/** How many monospace cells are needed to cover a box. */
export function gridSize(width, height, charWidth, lineHeight) {
  if (!charWidth || !lineHeight) return { cols: 0, rows: 0 };
  return {
    cols: Math.max(0, Math.ceil(width / charWidth)),
    rows: Math.max(0, Math.ceil(height / lineHeight)),
  };
}
