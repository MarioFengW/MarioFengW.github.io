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
export function stageShape(cols, rows, t, stage, from = stage, k = 1, shapes = STAGE_SHAPES) {
  const to = shapes[stage](cols, rows, t);
  if (from === stage || k >= 1) return to;
  const prev = shapes[from](cols, rows, t);
  const e = k * k * (3 - 2 * k);
  return (x, y) => prev(x, y) * (1 - e) + to(x, y) * e;
}

// ---------------------------------------------------------------- experience
// One shape per role, read from what the work did.

function smooth(e0, e1, x) {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
}

/** Research (MultiView stacking): three views stream in and merge into one prediction. */
export function streams(cols, rows, t) {
  const lanes = [0.22, 0.5, 0.78];
  const merge = 0.62; // where the views have joined
  const width = Math.max(1.4, rows * 0.05);
  return (x, y) => {
    const u = x / cols;
    const pull = smooth(0.08, merge, u);
    const pulse = 0.8 + 0.2 * Math.sin(x * 0.3 - t * 5); // data flowing along the lanes
    let m = 0;
    for (const lane of lanes) {
      const ly = (lane + (0.5 - lane) * pull) * rows;
      const d = y - ly;
      m = Math.max(m, gauss(d * d, width * (u > merge ? 1.6 : 1)));
    }
    return 0.05 + 1.5 * m * pulse;
  };
}

/** Data analyst (campaigns to 45,000+ contacts): rings broadcast from one source. */
export function broadcast(cols, rows, t) {
  const cx = cols * 0.32;
  const cy = rows * 0.5;
  const maxR = Math.hypot(cols, rows * 2) * 0.75;
  const gap = maxR / 4;
  const offset = (t * 9) % gap;
  return (x, y) => {
    const dx = x - cx;
    const dy = (y - cy) * 2;
    const r = Math.hypot(dx, dy);
    let m = gauss(r * r, 3); // the source
    for (let k = 0; k < 4; k++) {
      const ring = offset + k * gap;
      const d = r - ring;
      m = Math.max(m, gauss(d * d, 1.6) * (1 - ring / maxR));
    }
    return 0.05 + 1.5 * m;
  };
}

export const FRUIT = [
  [0.18, 0.35], [0.4, 0.68], [0.6, 0.3], [0.82, 0.62],
];

/** Which fruit the detector is on at time t. */
export function scanning(t) {
  return Math.floor(t * 0.9) % FRUIT.length;
}

/** Quality control (Mask R-CNN on tomatoes): round fruit, one boxed at a time. */
export function detection(cols, rows, t) {
  const r = Math.min(cols, rows * 2) * 0.09;
  const current = scanning(t);
  const pts = FRUIT.map(([fx, fy]) => ({ x: fx * cols, y: fy * rows }));
  return (x, y) => {
    let m = 0.05;
    pts.forEach((p, i) => {
      const dx = x - p.x;
      const dy = (y - p.y) * 2;
      const d = Math.hypot(dx, dy);
      const fruit = d < r ? 1.25 : gauss((d - r) * (d - r), 1) * 0.9;
      m = Math.max(m, i === current ? fruit + 0.1 : fruit * 0.75);
      if (i === current) {
        const bx = Math.abs(dx) - r * 1.5;
        const by = Math.abs(dy) - r * 1.5;
        const onEdge = Math.max(bx, by) > -1.2 && Math.max(bx, by) < 0.6;
        if (onEdge) m = Math.max(m, 1.45); // the bounding box
      }
    });
    return m;
  };
}

export const EXPERIENCE_SHAPES = [streams, broadcast, detection];
