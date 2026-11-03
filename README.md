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
  raises a hill that bends the contours. Runs at 24fps, pauses offscreen and in background tabs,
  and renders one static frame under `prefers-reduced-motion`.
- **Headings** decode from random glyphs the first time they scroll into view (`ScrambleText.jsx`);
  screen readers always get the real text.
- **Weather** (`AsciiWeather.jsx`) shows live conditions for a fixed city (`currentCity` in content)
  via Open-Meteo. No location permission is requested; it falls back to "weather offline".
- **Fonts:** JetBrains Mono for everything, Pixelta (`src/assets/fonts`) for display headings only.
  Pixelta has no apostrophe or `"$\^{|}~` glyphs, so keep display headings free of those characters.
