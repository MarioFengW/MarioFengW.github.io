// The contact section's wiring: one source ("you") fanning out to every channel.
// Rows alternate between a channel's wire and a vertical connector, so channel
// i sits on line 2i and links can be laid out on the same line grid.

const SOURCE = '[ you ] '; // no stub: the first arm starts at the junction
const ARM = '------> ';

/** Cells from the junction on row 0 down to channel `index`'s row, then along its arm. */
export function routePath(lines, index) {
  const row = index * 2;
  if (!lines[row]) return [];
  const jx = lines[0].indexOf('+');
  const path = [];
  for (let y = 0; y <= row; y++) path.push({ x: jx, y });
  for (let x = jx + 1; lines[row][x] === '-'; x++) path.push({ x, y: row });
  return path;
}

export function routeLines(count) {
  if (count <= 0) return [];
  const pad = ' '.repeat(SOURCE.length);
  const lines = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) lines.push(`${pad}|`);
    lines.push(`${i === 0 ? SOURCE : pad}+${ARM}`);
  }
  return lines;
}
