// A progress bar drawn as nebula gas: the filled part thickens from faint dust
// to dense gas toward a bright head, the rest is empty sky. Pure, so it can be
// tested; the component colours each part with the nebula layer colours.

const GAS = '.:-=+*#'; // faint to dense, like the nebula's density ramp

/** { dust, gas, head, sky } strings for `progress` (0..1) over `width` cells. */
export function nebulaBar(progress, width = 16) {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const filled = Math.round(p * width);
  const body = Math.max(0, filled - 1);
  let trail = '';
  for (let i = 0; i < body; i++) {
    // the last cells before the head are densest
    const k = body === 1 ? 1 : i / (body - 1);
    trail += GAS[Math.min(GAS.length - 1, Math.floor(k * (GAS.length - 1)))];
  }
  const split = Math.floor(trail.length / 2);
  return {
    dust: trail.slice(0, split),
    gas: trail.slice(split),
    head: filled > 0 ? '@' : '',
    sky: ' '.repeat(width - filled),
    percent: `${String(Math.round(p * 100)).padStart(3, ' ')}%`,
  };
}
