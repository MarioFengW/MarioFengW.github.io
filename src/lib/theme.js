// Light ("white") / dark ("black") theme. The page ships dark tokens on :root
// and light tokens under [data-theme='light'].

export const THEME_KEY = 'theme';
export const THEMES = ['dark', 'light'];
const META_COLOR = { dark: '#0b0d10', light: '#f4f2ec' };

export function isTheme(value) {
  return THEMES.includes(value);
}

export function nextTheme(theme) {
  return theme === 'light' ? 'dark' : 'light';
}

/** Saved choice wins; otherwise follow the OS (the visitor's ambient light). */
export function resolveTheme(saved, prefersLight) {
  if (isTheme(saved)) return saved;
  return prefersLight ? 'light' : 'dark';
}

/** Apply a theme to the document and remember it. Storage failures are ignored. */
export function applyTheme(theme, doc = document, storage = window.localStorage) {
  doc.documentElement.dataset.theme = theme;
  doc.documentElement.style.colorScheme = theme;
  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_COLOR[theme]);
  try {
    storage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Private mode / blocked storage: the theme still applies for this visit.
  }
}

/**
 * Inline <head> script: sets data-theme before first paint so a light-theme
 * visitor never sees a dark flash. Mirrors resolveTheme().
 */
export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t})();`;
