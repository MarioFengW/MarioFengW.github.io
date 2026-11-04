// Clearings: the page nebula opens around content instead of content sitting in
// boxes on top of it. Each clearing is a screen rectangle (a block of copy, a
// form); the gas thins to nothing inside it and returns over a soft edge, so
// text always reads on clear sky with only the stars showing.

const PAD_X = 2; // cells of open sky beside a block
const PAD_Y = 1; // rows of open sky above and below it
const EDGE = 4; // cells over which the gas returns

/** Screen rects (px) to cell rects, padded. Rects fully off screen are dropped. */
export function toCells(rects, cellW, cellH, cols, rows) {
  if (!cellW || !cellH) return [];
  return rects
    .map((r) => ({
      x0: r.left / cellW - PAD_X,
      x1: r.right / cellW + PAD_X,
      y0: r.top / cellH - PAD_Y,
      y1: r.bottom / cellH + PAD_Y,
    }))
    .filter((c) => c.x1 > 0 && c.x0 < cols && c.y1 > 0 && c.y0 < rows);
}

function smooth(x) {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
}

/** 0 inside any clearing, rising to 1 over EDGE cells outside it. */
export function clearingMask(cells) {
  if (!cells.length) return null;
  return (x, y) => {
    let open = 1;
    for (const c of cells) {
      const dx = Math.max(c.x0 - x, 0, x - c.x1);
      const dy = Math.max(c.y0 - y, 0, y - c.y1) * 2; // rows are ~2x taller than columns
      open = Math.min(open, smooth(Math.hypot(dx, dy) / EDGE));
      if (open === 0) return 0;
    }
    return open;
  };
}

/** A shape with the clearings cut out of it. */
export function withClearings(shape, mask) {
  if (!mask) return shape;
  return (x, y) => shape(x, y) * mask(x, y);
}
