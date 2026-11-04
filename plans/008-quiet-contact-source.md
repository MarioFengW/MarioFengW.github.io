# 008 — One packet per contact wire, trail glyphs that are not wiring

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW
- **Category**: Cohesion (legibility of motion)
- **Estimated scope**: 3 files, ~6 lines

## Problem

```js
// src/lib/routes.js:5 — current
const SOURCE = '[ you ] --';
```

The first contact row is `[ you ] --+------> `. The 2-dash stub before `+` is parsed as its own wire, so two packets run on one row. The trail glyph `+` (`src/lib/flow.js:6`, `const TRAIL = ['+', '.'];`) looks like the `+` junction, so that row reads as noise.

## Target

```js
// src/lib/routes.js — target
const SOURCE = '[ you ] '; // no stub: the first arm starts at the junction
```

```js
// src/lib/flow.js — target
const TRAIL = [':', '.']; // glyphs behind the head, nearest first
```

## Steps

1. Change `SOURCE` as in Target. `pad` is derived from `SOURCE.length`, so the rows stay aligned.
2. Change `TRAIL` as in Target.
3. Run `src/lib/routes.test.js` and `src/components/stages.test.jsx`; update any assertion that expected the stub. `findWires` must still find one horizontal wire per channel.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: in the contact section, each row carries exactly one packet, and no trail glyph looks like part of the wiring.
- **Done when**: the first row reads `[ you ] +------>` with one packet.
