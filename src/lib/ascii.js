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
 * Height of the topographic field at a cell.
 * x/y are in "cell" units; t is time in seconds; pointer is optional {x, y} in cells.
 * Returns roughly 0..1 (a little more under the pointer).
 */
export function fieldHeight(x, y, t, pointer) {
  // Characters are ~2x taller than wide; stretch y so the contours look round.
  const yy = y * 2;
  let h =
    Math.sin(x * 0.045 + t * 0.35) +
    Math.sin(yy * 0.05 - t * 0.25) +
    Math.sin((x + yy) * 0.032 + t * 0.2) +
    Math.sin(Math.hypot(x - 40, yy - 30) * 0.06 - t * 0.3);
  h = (h + 4) / 8; // normalise to 0..1

  if (pointer) {
    // A soft gaussian hill under the cursor bends the contour lines around it.
    const dx = x - pointer.x;
    const dy = (y - pointer.y) * 2;
    h += 0.35 * Math.exp(-(dx * dx + dy * dy) / 260);
  }
  return h;
}

/**
 * Turn a field height into a contour-line intensity: bright on the iso-lines,
 * fading quickly between them, which reads like a topographic map.
 */
export function contourIntensity(height, bands = 7, width = 0.16) {
  const f = height * bands;
  const distance = Math.abs(f - Math.round(f)); // 0 on a line, 0.5 between lines
  if (distance > width) return 0;
  return 1 - distance / width;
}

/** Render one full frame of the topographic field as a newline-joined string. */
export function renderTopoFrame(cols, rows, t, pointer = null, ramp = RAMP) {
  if (cols <= 0 || rows <= 0) return '';
  const lines = new Array(rows);
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      line += charForIntensity(contourIntensity(fieldHeight(x, y, t, pointer)), ramp);
    }
    lines[y] = line;
  }
  return lines.join('\n');
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
