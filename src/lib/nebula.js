// ASCII nebula: domain-warped fractal noise rendered as coloured glyph layers.
// Pure functions only (no DOM) so they can be unit-tested and benchmarked.
import { RAMP, charForIntensity, clamp } from './ascii';

const SIZE = 256;
const MASK = SIZE - 1;

// Deterministic random lattice (LCG) — fast lookups instead of sin() hashing.
const LATTICE = (() => {
  const table = new Float32Array(SIZE * SIZE);
  let seed = 1337;
  for (let i = 0; i < table.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    table[i] = seed / 4294967296;
  }
  return table;
})();

export function lattice(x, y) {
  return LATTICE[(x & MASK) + ((y & MASK) << 8)];
}

/** Smooth value noise in 0..1. */
export function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = lattice(xi, yi);
  const b = lattice(xi + 1, yi);
  const c = lattice(xi, yi + 1);
  const d = lattice(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal Brownian motion: layered value noise, normalised to 0..1. */
export function fbm(x, y, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const CELL = 22; // cells per noise unit: bigger = larger gas structures
const STAR_RATE = 0.993; // ~0.7% of empty cells hold a star

/**
 * Sample the nebula at a cell. Returns density (0..1+), hue (0..1) and a star
 * brightness (0..1, 0 = no star). `pointer` (in cells) swirls and brightens the gas.
 */
export function nebulaSample(x, y, t, pointer = null) {
  let u = x / CELL + t * 0.018;
  let v = (y * 2) / CELL; // glyphs are ~2x taller than wide
  let glow = 0;

  if (pointer) {
    const px = pointer.x / CELL + t * 0.018;
    const py = (pointer.y * 2) / CELL;
    const dx = u - px;
    const dy = v - py;
    const falloff = Math.exp(-(dx * dx + dy * dy) / 0.9);
    const angle = 1.4 * falloff; // swirl strongest at the cursor
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    u = px + dx * cos - dy * sin;
    v = py + dx * sin + dy * cos;
    glow = 0.28 * falloff;
  }

  // Domain warp: noise displaces the lookup of more noise -> wispy filaments.
  const qx = fbm(u + 1.7, v + 9.2 + t * 0.03, 2);
  const qy = fbm(u + 8.3 - t * 0.025, v + 2.8, 2);
  const raw = fbm(u + 3.2 * qx, v + 3.2 * qy, 4);
  const density = smoothstep(0.44, 0.8, raw) + glow;
  const hue = fbm(u * 0.45 + 20, v * 0.45 + t * 0.01, 2);

  const starSeed = lattice(x * 7 + 3, y * 13 + 5);
  let star = 0;
  if (density < 0.08 && starSeed > STAR_RATE) {
    star = 0.5 + 0.5 * Math.sin(t * (1.5 + starSeed * 2) + starSeed * 40);
  }
  return { density, hue, star };
}

// Layer order is paint order: faint dust at the back, hot core and stars on top.
export const NEBULA_LAYERS = ['dust', 'blue', 'rose', 'core'];
const STAR_GLYPHS = '.+*';

/** Which layer + glyph a sample becomes. Returns null for empty space. */
export function classifyCell({ density, hue, star }, ramp = RAMP) {
  if (star > 0) {
    return { layer: 3, char: STAR_GLYPHS[Math.min(STAR_GLYPHS.length - 1, Math.floor(star * STAR_GLYPHS.length))] };
  }
  // 0.06 is above the ramp's first non-blank step, so `char` is never ' ' here.
  if (density < 0.06) return null;
  const char = charForIntensity(Math.min(1, density), ramp);
  if (density > 0.85) return { layer: 3, char };
  if (density < 0.32) return { layer: 0, char };
  return { layer: hue > 0.5 ? 2 : 1, char };
}

/**
 * Render one frame as one string per layer (same dimensions, spaces elsewhere),
 * so each layer can be a stacked <pre> with its own colour.
 */
export function renderNebulaLayers(cols, rows, t, pointer = null) {
  const count = NEBULA_LAYERS.length;
  if (cols <= 0 || rows <= 0) return new Array(count).fill('');
  const rowsOut = Array.from({ length: count }, () => new Array(rows));
  const line = Array.from({ length: count }, () => new Array(cols));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      for (let l = 0; l < count; l++) line[l][x] = ' ';
      const cell = classifyCell(nebulaSample(x, y, t, pointer));
      if (cell) line[cell.layer][x] = cell.char;
    }
    for (let l = 0; l < count; l++) rowsOut[l][y] = line[l].join('');
  }
  return rowsOut.map((r) => r.join('\n'));
}
