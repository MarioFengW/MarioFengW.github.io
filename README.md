# Mario Feng Portfolio

Gatsby portfolio site built with React and component-scoped content data.

## Development

```bash
npm install
npm run develop
```

Open http://localhost:8000.

## Production build

```bash
npm run build
npm run serve
```

## Tests

```bash
npm test               # Vitest + Testing Library
npm run test:coverage  # fails below 80% lines/functions/statements, 75% branches
```

CI runs `npm test` before every deploy.

## How the ASCII design works

- **Content** lives in `src/data/content.js`. Edit text, projects, experience and links there.
- **Hero field** (`src/components/AsciiField.jsx`) is a live ASCII topographic map:
  the height field and contour math are pure functions in `src/lib/ascii.js`, and the pointer
  raises a hill that bends the contours. Runs at 24fps and pauses offscreen and in background tabs.
  A `[ pause ascii ]` button in the hero stops/starts it (WCAG 2.2.2). If the OS asks for reduced
  motion it starts paused, but visitors can still press play.
- **Motion** uses [`motion`](https://motion.dev) (`m` + `LazyMotion`), with every duration, easing and
  spring in `src/lib/motion-tokens.js`: typewriter hero intro, staggered scroll reveals, animated
  accordion and impact counters. `MotionConfig reducedMotion="user"` drops movement but keeps fades.
  Elements hidden for an entrance animation carry `data-reveal`, and a `<noscript>` style (in
  `gatsby-ssr.js`) shows them when JavaScript is off.
- **Scroll meter** in the header is an ASCII progress bar (`asciiProgress` in `src/lib/ascii.js`).
- **Headings** decode from random glyphs the first time they scroll into view (`ScrambleText.jsx`);
  screen readers always get the real text.
- **Weather** (`AsciiWeather.jsx`) shows live conditions for a fixed city (`currentCity` in content)
  via Open-Meteo. No location permission is requested; it falls back to "weather offline".
- **Fonts:** JetBrains Mono (self-hosted via `@fontsource`, no Google Fonts request) for everything, Pixelta (`src/assets/fonts`) for display headings only.
  Pixelta has no apostrophe or `"$\^{|}~` glyphs, so keep display headings free of those characters.
