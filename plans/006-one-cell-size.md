# 006 — One cell size for every nebula field

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, ~8 lines

## Problem

The hero field uses `13px/15px` (`src/styles/global.css:184`) while the expertise stage overrides it to `12px/14px` (`global.css:329`). Scrolling from the hero into Expertise, the "same" nebula changes grain.

```css
/* src/styles/global.css:184 — current */
font: 400 13px/15px var(--mono);
/* src/styles/global.css:329 — current */
.nebula-stage .ascii-field-pre { font-size: 12px; line-height: 14px; }
```

The same `13px/15px` literal also appears at about lines 260, 289, 522 and 609.

## Target

```css
/* :root, next to the --fs-* tokens */
--cell-font: 13px;
--cell-line: 15px;

/* every ASCII field */
font: 400 var(--cell-font)/var(--cell-line) var(--mono);
```

Delete the `.nebula-stage .ascii-field-pre` override.

## Steps

1. Add the two tokens in the `:root` block where `--fs-xs` is defined.
2. Replace every `13px/15px` monospace declaration with `var(--cell-font)/var(--cell-line)`.
3. Delete `.nebula-stage .ascii-field-pre { ... }`. If plan 003 added a phone override, express it as `.nebula-stage { --cell-font: 15px; --cell-line: 17px; }` inside the same media query.

## Boundaries

- Do NOT change the diagram text size (`.ascii-flow pre`): diagrams are text-sized drawings, not fields.

## Verification

- **Mechanical**: `npm run build`; `grep -n "13px/15px" src/styles/global.css` returns nothing.
- **Feel check**: scroll from the hero into Expertise; the glyph grain looks continuous.
- **Done when**: one token pair controls every nebula field's cell size.
