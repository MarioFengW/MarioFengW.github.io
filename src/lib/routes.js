// The contact section's wiring: one source ("you") fanning out to every channel.
// Rows alternate between a channel's wire and a vertical connector, so channel
// i sits on line 2i and links can be laid out on the same line grid.

const SOURCE = '[ you ] --';
const ARM = '------> ';

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
