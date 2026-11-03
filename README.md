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
- **Hero nebula** (`src/components/AsciiField.jsx`, math in `src/lib/nebula.js`): domain-warped
  fractal noise drawn as four coloured glyph layers (dust, blue, rose, hot core) plus twinkling
  stars; the pointer swirls and brightens the gas. ~4ms per full-desktop frame at 24fps; pauses
  offscreen and in background tabs. Shared loop/measure logic lives in `src/hooks/useAsciiLoop.js`.
- **Boot screen** (`BootScreen.jsx`): a ~0.6s terminal boot log on every load, dissolving in an
  ASCII wipe; the hero intro starts as it fades. Click/any key skips; skipped under reduced motion;
  hidden without JS; a CSS fail-safe removes it after 4s if JS never runs.
- **Weather backdrop** (`WeatherBackdrop.jsx`, scenes in `src/lib/weatherField.js`): the live
  Taipei condition (rain, storm with lightning, snow, clouds, fog, wind, sun rays or stars) fills
  the whole About section; `WeatherStatus.jsx` shows the reading.
- **Section dividers** (`SectionDivider.jsx`): scroll-linked ASCII bands between sections that sweep
  in and out as you scroll past, labelled with the next section. Headings print in behind a
  scanline, and the hero fades out on scroll (CSS scroll-driven animation, progressive enhancement).
  A `[ pause ascii ]` button in the hero stops/starts it (WCAG 2.2.2). If the OS asks for reduced
  motion it starts paused, but visitors can still press play.
- **Motion** uses [`motion`](https://motion.dev) (`m` + `LazyMotion`), with every duration, easing and
  spring in `src/lib/motion-tokens.js`: typewriter hero intro, staggered scroll reveals, animated
  accordion and impact counters. `MotionConfig reducedMotion="user"` drops movement but keeps fades.
  Elements hidden for an entrance animation carry `data-reveal`, and a `<noscript>` style (in
  `gatsby-ssr.js`) shows them when JavaScript is off.
- **Scroll meter** in the header is an ASCII progress bar (`asciiProgress` in `src/lib/ascii.js`).
- **Section transitions** (`PageTransition.jsx`): clicking any in-page `#link` plays a diagonal ASCII
  wipe (cover 180ms, jump while covered, reveal 300ms), then moves focus to the section and records
  it in history. Never blocks input, and a second click interrupts it. Keyboard activation and reduced
  motion jump instantly; add `data-no-transition` to a link to opt out (the skip link does).
- **State transitions:** the nav marks the current section (`aria-current`) with a drawn underline;
  the mobile menu fades/slides in with staggered items; the weather reading crossfades; the experience
  accordion opens with a CSS grid-rows transition (closed panels are `inert`); buttons and CTAs have
  press feedback. Hover effects only apply to fine pointers (`hover: hover`), never on touch.
- **Headings** decode from random glyphs the first time they scroll into view (`ScrambleText.jsx`);
  screen readers always get the real text.
- **Weather** (`AsciiWeather.jsx`) shows live conditions for a fixed city (`currentCity` in content)
  via Open-Meteo. No location permission is requested; it falls back to "weather offline".
- **Fonts:** JetBrains Mono (self-hosted via `@fontsource`, no Google Fonts request) for everything, Pixelta (`src/assets/fonts`) for display headings only.
  Pixelta has no apostrophe or `"$\^{|}~` glyphs, so keep display headings free of those characters.
