// Full-section ASCII weather scenes, one per condition. Pure: (type, cols, rows, t) -> frame.
import { charForIntensity, clamp } from './ascii';
import { fbm, lattice, smoothstep } from './nebula';

function grid(cols, rows) {
  return Array.from({ length: rows }, () => new Array(cols).fill(' '));
}

function put(cells, x, y, char) {
  if (y >= 0 && y < cells.length && x >= 0 && x < cells[0].length) cells[y][x] = char;
}

const RAIN_TAIL = "/'.";

/** Diagonal rain streaks falling down-left. `heavy` = storm density and speed. */
function rain(cells, cols, rows, t, heavy) {
  const share = heavy ? 0.5 : 0.28; // fraction of columns carrying drops
  for (let x = 0; x < cols; x++) {
    if (lattice(x, 11) > share) continue;
    for (let k = 0; k < 2; k++) {
      const speed = (heavy ? 26 : 17) + lattice(x, 31 + k) * 10; // rows per second
      const len = 2 + Math.floor(lattice(x, 47 + k) * 3);
      const span = rows + len + 4;
      const head = Math.floor((lattice(x, 71 + k) * span + t * speed) % span);
      for (let j = 0; j < len; j++) {
        const y = head - j;
        const xx = (((x - Math.floor(y * 0.4)) % cols) + cols) % cols;
        put(cells, xx, y, RAIN_TAIL[Math.min(j, RAIN_TAIL.length - 1)]);
      }
    }
  }
}

function snow(cells, cols, rows, t) {
  for (let x = 0; x < cols; x++) {
    if (lattice(x, 13) > 0.22) continue;
    for (let k = 0; k < 2; k++) {
      const phase = lattice(x, 29 + k);
      const speed = 1.6 + phase * 2.4;
      const y = Math.floor((phase * rows + t * speed) % rows);
      const xx = x + Math.round(Math.sin(t * 0.8 + phase * 6.28) * 2);
      put(cells, xx, y, phase > 0.6 ? '*' : phase > 0.3 ? '+' : '.');
    }
  }
}

function stars(cells, cols, rows, t, rate = 0.985) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const seed = lattice(x * 5 + 1, y * 9 + 2);
      if (seed <= rate) continue;
      const twinkle = 0.5 + 0.5 * Math.sin(t * (1.2 + seed * 2) + seed * 40);
      put(cells, x, y, twinkle > 0.75 ? '*' : twinkle > 0.35 ? '+' : '.');
    }
  }
}

const SOFT_RAMP = ' .:-=+*';

/** Noise field drawn through a ramp: clouds (puffy) and fog (stretched bands). */
function noiseField(cells, cols, rows, t, { scaleX, scaleY, drift, low, high, ramp, gain = 1 }) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const d = fbm(x / scaleX + t * drift, (y * 2) / scaleY, 4);
      const intensity = smoothstep(low, high, d) * gain;
      if (intensity > 0.02) cells[y][x] = charForIntensity(intensity, ramp);
    }
  }
}

/** Sun: slow rotating rays from the top-right corner plus heat shimmer. */
function sun(cells, cols, rows, t) {
  const ox = cols * 0.88;
  const oy = -rows * 0.15;
  const reach = Math.hypot(cols, rows * 2);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - ox;
      const dy = (y - oy) * 2;
      const angle = Math.atan2(dy, dx);
      const ray = Math.sin(angle * 16 + t * 0.35);
      const falloff = 1 - Math.hypot(dx, dy) / reach;
      const intensity = clamp((ray - 0.6) / 0.4, 0, 1) * falloff * falloff;
      if (intensity > 0.05) cells[y][x] = charForIntensity(intensity, ' .-~=');
    }
  }
}

/** Wind: fast horizontal streaks on a subset of rows. */
function wind(cells, cols, rows, t) {
  for (let y = 0; y < rows; y++) {
    if (lattice(y, 5) > 0.35) continue;
    for (let k = 0; k < 2; k++) {
      const len = 5 + Math.floor(lattice(y, 17 + k) * 10);
      const speed = 28 + lattice(y, 23 + k) * 24;
      const span = cols + len;
      const head = Math.floor((lattice(y, 37 + k) * span + t * speed) % span);
      for (let j = 0; j < len; j++) put(cells, head - j, y, j === 0 ? '~' : '-');
    }
  }
}

/** Lightning flickers twice every 6 seconds. */
export function isFlash(t) {
  const phase = t % 6;
  return phase < 0.08 || (phase > 0.16 && phase < 0.22);
}

export const WEATHER_SCENES = ['sun', 'night', 'cloud', 'fog', 'rain', 'thunder', 'snow', 'wind'];

/** Render the scene for a weather type. Unknown types fall back to clouds. */
export function renderWeatherField(type, cols, rows, t) {
  if (cols <= 0 || rows <= 0) return { text: '', flash: false };
  const cells = grid(cols, rows);
  let flash = false;
  switch (type) {
    case 'sun':
      sun(cells, cols, rows, t);
      break;
    case 'night':
      stars(cells, cols, rows, t);
      break;
    case 'fog':
      noiseField(cells, cols, rows, t, { scaleX: 48, scaleY: 10, drift: 0.06, low: 0.42, high: 0.7, ramp: ' ._-~', gain: 0.8 });
      break;
    case 'rain':
      noiseField(cells, cols, rows, t, { scaleX: 26, scaleY: 26, drift: 0.04, low: 0.6, high: 0.8, ramp: SOFT_RAMP, gain: 0.5 });
      rain(cells, cols, rows, t, false);
      break;
    case 'thunder':
      noiseField(cells, cols, rows, t, { scaleX: 26, scaleY: 26, drift: 0.06, low: 0.55, high: 0.78, ramp: SOFT_RAMP, gain: 0.7 });
      rain(cells, cols, rows, t, true);
      flash = isFlash(t);
      break;
    case 'snow':
      snow(cells, cols, rows, t);
      break;
    case 'wind':
      wind(cells, cols, rows, t);
      break;
    default:
      noiseField(cells, cols, rows, t, { scaleX: 22, scaleY: 22, drift: 0.05, low: 0.5, high: 0.78, ramp: SOFT_RAMP });
  }
  return { text: cells.map((row) => row.join('')).join('\n'), flash };
}
