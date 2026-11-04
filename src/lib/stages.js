// Shapes the nebula takes in the "What I work on" stage. Each factory returns a
// pure density multiplier `(x, y) => m` for one frame (cells, time in seconds).
// Gas outside the shape thins out; inside it gathers and brightens.

const TAU = Math.PI * 2;

function gauss(d2, r) {
  return Math.exp(-d2 / (2 * r * r));
}

/** Machine learning: the gas condenses into three clusters that orbit slowly. */
export function clusters(cols, rows, t) {
  const r = Math.min(cols, rows * 2) * 0.16;
  const centers = [0, 1, 2].map((i) => {
    const a = t * 0.18 + (i * TAU) / 3;
    return { x: cols * (0.5 + 0.26 * Math.cos(a)), y: rows * (0.5 + 0.28 * Math.sin(a)) };
  });
  return (x, y) => {
    let m = 0;
    for (const c of centers) {
      const dx = x - c.x;
      const dy = (y - c.y) * 2; // cells are ~2x taller than wide
      m = Math.max(m, gauss(dx * dx + dy * dy, r));
    }
    return 0.08 + 1.5 * m;
  };
}

/** Full stack: three layers (ui, api, data) joined by a channel of requests. */
export function layers(cols, rows, t) {
  const bands = [0.2, 0.5, 0.8];
  const thickness = Math.max(1.2, rows * 0.07);
  const mid = cols / 2;
  return (x, y) => {
    let band = 0;
    for (const b of bands) {
      const d = y - b * rows;
      band = Math.max(band, gauss(d * d, thickness));
    }
    const dx = x - mid;
    const channel = gauss(dx * dx, 2.2) * (0.5 + 0.5 * Math.sin(y * 0.7 - t * 5));
    return 0.06 + Math.max(1.4 * band, 1.6 * channel);
  };
}

export const GRID = { cols: 3, rows: 2 };
const ROLLOUT_SLOTS = GRID.cols * GRID.rows + 2; // all lit for a beat, then restart

/** How many containers are up at time t (a rolling deploy, 0..6). */
export function containersUp(t) {
  return Math.min(GRID.cols * GRID.rows, Math.floor(t * 1.1) % ROLLOUT_SLOTS);
}

/** Cloud: a 3x2 grid of containers that come up one by one, then recycle. */
export function containers(cols, rows, t) {
  const up = containersUp(t);
  const cw = cols / GRID.cols;
  const ch = rows / GRID.rows;
  return (x, y) => {
    const gx = Math.min(GRID.cols - 1, Math.floor(x / cw));
    const gy = Math.min(GRID.rows - 1, Math.floor(y / ch));
    const lx = (x - gx * cw) / cw;
    const ly = (y - gy * ch) / ch;
    const inset = 0.12;
    if (lx < inset || lx > 1 - inset || ly < inset * 1.6 || ly > 1 - inset * 1.6) return 0.04;
    const edge = lx < inset + 0.05 || lx > 0.95 - inset || ly < inset * 1.6 + 0.1 || ly > 0.9 - inset * 1.6;
    const lit = gy * GRID.cols + gx < up;
    if (edge) return 1.25;
    return lit ? 1.15 : 0.1;
  };
}

export const STAGE_SHAPES = [clusters, layers, containers];

/** Shape for `stage`, cross-fading from `from` while `k` goes 0 -> 1. */
export function stageShape(cols, rows, t, stage, from = stage, k = 1) {
  const to = STAGE_SHAPES[stage](cols, rows, t);
  if (from === stage || k >= 1) return to;
  const prev = STAGE_SHAPES[from](cols, rows, t);
  const e = k * k * (3 - 2 * k);
  return (x, y) => prev(x, y) * (1 - e) + to(x, y) * e;
}
