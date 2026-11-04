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

// ------------------------------------------------------------ whole page
// Shapes for the sections that are not a list of stages.

/** Hero: dense on the right, quiet behind the copy (top-heavy on narrow screens). */
export function heroGas(cols, rows) {
  if (cols < 70) return (x, y) => 0.15 + 1.1 * (1 - smooth(0.18, 0.45, y / rows));
  return (x) => 0.15 + 1.1 * smooth(0.3, 0.85, x / cols);
}

/** Between moments: thin gas everywhere, stars keep twinkling. */
export function quietGas() {
  return () => 0.35;
}

/** The live Taipei weather, in gas: rain streaks, snowfall, cloud banks, fog, wind, sun. */
export function weatherGas(type) {
  return (cols, rows, t) => {
    switch (type) {
      case 'rain':
      case 'thunder':
      case 'storm': {
        const flash = type !== 'rain' && t % 4 < 0.12;
        return (x, y) => {
          if (flash) return 1.2;
          const lane = x % 5 === 0;
          const drop = (((y - t * 14 + x * 3.7) % 9) + 9) % 9;
          return lane && drop < 3 ? 1.4 : 0.12;
        };
      }
      case 'snow':
        return (x, y) => {
          const fall = Math.floor(y - t * 3 + Math.sin(t + x) * 0.6);
          return (x * 13 + fall * 7) % 23 === 0 ? 1.4 : 0.18;
        };
      case 'cloud':
        return (x, y) => {
          const d = y - rows * 0.35 - Math.sin(x * 0.08 + t * 0.4) * rows * 0.06;
          return 0.15 + 1.2 * gauss(d * d, rows * 0.12);
        };
      case 'fog':
        return () => 0.75;
      case 'wind':
        return (x, y) => {
          const streak = (((x - y * 2 - t * 20) % 17) + 17) % 17;
          return streak < 4 ? 1.3 : 0.15;
        };
      case 'sun':
        return (x, y) => {
          const dx = x - cols * 0.8;
          const dy = (y - rows * 0.2) * 2;
          const r2 = dx * dx + dy * dy;
          const ray = 0.5 + 0.5 * Math.cos(Math.atan2(dy, dx) * 8 + t * 0.6);
          return 0.12 + 1.5 * gauss(r2, cols * 0.08) + 0.6 * ray * gauss(r2, cols * 0.25);
        };
      default:
        return () => 0.25; // clear night: let the stars show
    }
  };
}

// --------------------------------------------------------------- projects

function segmentDistance2(dx, dy, vx, vy) {
  const k = Math.max(0, Math.min(1, (dx * vx + dy * vy) / (vx * vx + vy * vy)));
  const px = dx - k * vx;
  const py = dy - k * vy;
  return { d2: px * px + py * py, k };
}

/** ForgeTask (RAG reporting): scattered documents funnel into retrieval, out come clean lines. */
export function retrieval(cols, rows, t) {
  return (x, y) => {
    const u = x / cols;
    if (u < 0.45) {
      const seed = (Math.floor(x / 3) * 31 + Math.floor((y + t * 2) / 2) * 17) % 11;
      const squeeze = 1 - smooth(0.2, 0.45, u) * Math.min(1, Math.abs(y - rows / 2) / (rows * 0.25));
      return seed === 0 ? 1.3 * squeeze : 0.1; // documents drifting toward the funnel
    }
    if (u < 0.55) {
      const d = y - rows / 2;
      return 0.1 + 1.5 * gauss(d * d, rows * 0.05); // the retrieval neck
    }
    let m = 0.08;
    [0.38, 0.5, 0.62].forEach((lane) => {
      const d = y - lane * rows;
      m = Math.max(m, 1.4 * gauss(d * d, 0.9) * (0.75 + 0.25 * Math.sin(x * 0.4 - t * 6)));
    });
    return m; // the report
  };
}

/** In & Out (food-bank logistics): donors, drivers and admins meet at a hub; routes fan out. */
export function hub(cols, rows, t) {
  const cx = cols * 0.45;
  const cy = rows * 0.5;
  const ends = [
    [0.05, 0.2], [0.05, 0.5], [0.05, 0.8],
    [0.95, 0.1], [0.95, 0.37], [0.95, 0.63], [0.95, 0.9],
  ].map(([fx, fy]) => ({ vx: fx * cols - cx, vy: (fy * rows - cy) * 2 }));
  return (x, y) => {
    const dx = x - cx;
    const dy = (y - cy) * 2;
    let m = 0.08 + 1.6 * gauss(dx * dx + dy * dy, 3);
    ends.forEach(({ vx, vy }) => {
      const { d2, k } = segmentDistance2(dx, dy, vx, vy);
      m = Math.max(m, 1.3 * gauss(d2, 0.9) * (0.6 + 0.4 * Math.sin(k * 14 - t * 5)));
    });
    return m;
  };
}

export const PAIRS = [2, 0, 4, 1, 3];

/** Connect the Schools (needs matching): schools left, partners right, matched one by one. */
export function matching(cols, rows, t) {
  const n = PAIRS.length;
  const lit = Math.floor(t * 0.8) % (n + 1);
  const at = (fx, i) => ({ x: cols * fx, y: rows * ((i + 0.5) / n) });
  return (x, y) => {
    let m = 0.08;
    for (let i = 0; i < n; i++) {
      [at(0.18, i), at(0.82, i)].forEach((p) => {
        const dx = x - p.x;
        const dy = (y - p.y) * 2;
        m = Math.max(m, 1.5 * gauss(dx * dx + dy * dy, 1.8));
      });
      if (i < lit) {
        const a = at(0.18, i);
        const b = at(0.82, PAIRS[i]);
        const { d2 } = segmentDistance2(x - a.x, (y - a.y) * 2, b.x - a.x, (b.y - a.y) * 2);
        m = Math.max(m, 1.25 * gauss(d2, 0.7));
      }
    }
    return m;
  };
}

/** Hack2Dawn (Capture The Flag): a flag waving on its pole. */
export function flag(cols, rows, t) {
  const pole = cols * 0.35;
  const top = rows * 0.18;
  const w = cols * 0.32;
  const h = rows * 0.32;
  return (x, y) => {
    if (Math.abs(x - pole) < 0.8 && y > top && y < rows * 0.9) return 1.3;
    const u = (x - pole) / w;
    if (u < 0 || u > 1) return 0.08;
    const wave = Math.sin(u * 5 - t * 4) * rows * 0.04 * u;
    const v = (y - top - wave) / h;
    return v >= 0 && v <= 1 ? 1.15 + 0.3 * Math.sin(u * 9 - t * 4) : 0.08;
  };
}

export const PROJECT_SHAPES = [retrieval, hub, matching, flag];

/** Cross-fade between two shape factories while k goes 0 -> 1. */
export function blendShapes(from, to, cols, rows, t, k) {
  const next = to(cols, rows, t);
  if (!from || from === to || k >= 1) return next;
  const prev = from(cols, rows, t);
  const e = k * k * (3 - 2 * k);
  return (x, y) => prev(x, y) * (1 - e) + next(x, y) * e;
}
