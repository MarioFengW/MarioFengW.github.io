// Packets of nebula light travelling along the wires of an ASCII diagram.
// Pure functions: parse a diagram's wires once, then render any moment of it.

const SPEED = 9; // cells per second
const GAP = 7; // empty cells between packets on the same wire
const TRAIL = ['+', '.']; // glyphs behind the head, nearest first

/**
 * Find the wires in a diagram: horizontal runs of '-' (direction from an
 * arrowhead: '>' forward, '<' backward, both = two-way) and vertical runs of '|'.
 * Arrowheads themselves stay part of the drawing; packets travel the shaft.
 */
export function findWires(lines) {
  const wires = [];
  lines.forEach((line, y) => {
    const re = /-{2,}/g;
    let match = re.exec(line);
    while (match) {
      const x0 = match.index;
      const x1 = x0 + match[0].length - 1;
      const back = line[x0 - 1] === '<';
      const fwd = line[x1 + 1] === '>' || !back;
      wires.push({ axis: 'x', y, x0, x1, dirs: [fwd && 1, back && -1].filter(Boolean) });
      match = re.exec(line);
    }
  });
  const width = Math.max(0, ...lines.map((line) => line.length));
  for (let x = 0; x < width; x++) {
    let y = 0;
    while (y < lines.length) {
      if (lines[y][x] === '|') {
        const y0 = y;
        while (y + 1 < lines.length && lines[y + 1][x] === '|') y += 1;
        wires.push({ axis: 'y', x, y0, y1: y, dirs: [1] });
      }
      y += 1;
    }
  }
  return wires;
}

/** Cells lit on one wire at time t: [{ x, y, glyph, part: 'head' | 'trail' }]. */
export function wireCells(wire, t) {
  const length = wire.axis === 'x' ? wire.x1 - wire.x0 + 1 : wire.y1 - wire.y0 + 1;
  const period = length + GAP;
  const seed = (wire.axis === 'x' ? wire.y * 7 + wire.x0 : wire.x * 5 + wire.y0) % period;
  const cells = [];
  wire.dirs.forEach((dir, packet) => {
    const shift = packet * Math.floor(period / 2);
    const head = Math.floor(t * SPEED + seed + shift) % period;
    [head, ...TRAIL.map((_, i) => head - i - 1)].forEach((step, i) => {
      if (step < 0 || step >= length) return;
      const along = dir === 1 ? step : length - 1 - step;
      const x = wire.axis === 'x' ? wire.x0 + along : wire.x;
      const y = wire.axis === 'x' ? wire.y : wire.y0 + along;
      cells.push({ x, y, glyph: i === 0 ? '*' : TRAIL[i - 1], part: i === 0 ? 'head' : 'trail' });
    });
  });
  return cells;
}

/**
 * One frame as three same-sized strings: the drawing with lit cells blanked
 * (`base`), and the packet trails and heads, each for its own coloured <pre>.
 */
export function flowFrame(lines, wires, t) {
  const width = Math.max(0, ...lines.map((line) => line.length));
  const grid = (fill) => lines.map((line) => (fill ? line.padEnd(width, ' ') : ' '.repeat(width)).split(''));
  const base = grid(true);
  const trail = grid(false);
  const head = grid(false);
  wires.forEach((wire) => {
    wireCells(wire, t).forEach(({ x, y, glyph, part }) => {
      base[y][x] = ' ';
      (part === 'head' ? head : trail)[y][x] = glyph;
    });
  });
  const join = (rows) => rows.map((row) => row.join('').replace(/\s+$/, '')).join('\n');
  return { base: join(base), trail: join(trail), head: join(head) };
}
