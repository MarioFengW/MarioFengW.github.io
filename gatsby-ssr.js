import React from 'react';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './src/styles/global.css';
import { THEME_SCRIPT } from './src/lib/theme';

// Not exported: gatsby-ssr.js may only export Gatsby API names (else error #11329).
// Content is visible by default; only the boot overlay needs hiding without JS.
const NO_JS_CSS = '.boot{display:none!important}';

export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  setHeadComponents([
    // Runs before first paint: picks the saved / OS theme so there is no flash.
    <script key="theme" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />,
    <noscript key="no-js" dangerouslySetInnerHTML={{ __html: `<style>${NO_JS_CSS}</style>` }} />,
  ]);
};
