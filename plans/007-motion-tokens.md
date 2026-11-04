# 007 — Name the duration and frame-rate scale

- **Status**: DONE
- **Commit**: d9d3755
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 5 files, many small replacements

## Problem

`src/styles/global.css` uses literal durations `.08s .12s .18s .2s .22s .3s .42s .6s`, and `useAsciiLoop` callers pass 24, 20 and 20 fps while `AsciiFlow` uses 12. There is no named scale, so new work drifts.

## Target

```css
/* :root, next to --ease and --ease-move */
--dur-press: .12s;   /* :active scale feedback */
--dur-ui: .18s;      /* hover colour, small state changes */
--dur-panel: .22s;   /* accordion, mobile menu */
--dur-state: .3s;    /* larger state changes */
--dur-ambient: .6s;  /* weather and decorative fades */
```

```js
// src/lib/motion-tokens.js — add
export const frameRates = { hero: 24, weather: 20, field: 14, morph: 24 };
```

Mapping: `.08s` and `.12s` become `--dur-press`; `.18s` and `.2s` become `--dur-ui`; `.22s` becomes `--dur-panel`; `.3s` becomes `--dur-state`; `.6s` becomes `--dur-ambient`. Keep `.42s` (theme wipe) literal with a comment saying it is a one-off View Transition. If plan 005 changed the stage step transition to `.7s`, keep it literal with a comment "matches MORPH_S".

## Steps

1. Add the CSS tokens and replace each literal per the mapping.
2. Add `frameRates` to `motion-tokens.js` and use it in `AsciiField.jsx`, `WeatherBackdrop.jsx` and `NebulaStage.jsx`. `AsciiFlow` keeps `FLOW_RATE` from plan 001.

## Boundaries

- The only value changes allowed are `.08s` to `.12s` and `.2s` to `.18s` from the mapping.

## Verification

- **Mechanical**: `npx vitest run`; `npm run build`.
- **Feel check**: hover nav links, buttons and contact links; press buttons; open the experience accordion. Nothing should feel different.
- **Done when**: every duration in `global.css` is a token or a commented exception.
