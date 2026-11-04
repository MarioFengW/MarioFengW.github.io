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
  in and out as you scroll past, labelled with the next section. The hero fades out on scroll (CSS
  scroll-driven animation, progressive enhancement). A `[ pause ascii ]` button in the hero
  stops/starts the nebula (WCAG 2.2.2); under reduced motion it starts paused but can still be played.
- **Scroll-linked sections** (`useScrollLinked` hook, maths in `src/lib/scrollMath.js`): the
  experience timeline's rail fills as you read and lights each milestone it reaches; projects form a
  sticky stack where each covered card recedes (scale/shade written straight to the element, no React
  re-render). Both only listen to scroll while on screen.
- **Theme switch** (`ThemeToggle.jsx`, `src/lib/theme.js`): dark ("black") and light ("white") token
  sets. An inline head script applies the saved or OS theme before first paint (no flash); pointer
  toggles reveal the new theme with a View Transition scanline wipe, keyboard toggles and reduced
  motion switch instantly.
- **No animation library.** Every effect is CSS, a View Transition, or a small rAF loop; content is
  visible by default (nothing waits on JS to appear). JS timing tokens live in `src/lib/motion-tokens.js`.
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
