import React from 'react';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './src/styles/global.css';

// Scroll-reveal elements are server-rendered at opacity 0 and animated in by JS.
// Without JS, show them as-is. (Set here, not in Head, so the <style> isn't escaped.)
// Not exported: gatsby-ssr.js may only export Gatsby API names (else error #11329).
const NO_JS_CSS =
  '[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}.boot{display:none!important}';

export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en' });
  setHeadComponents([
    <noscript key="no-js-reveal" dangerouslySetInnerHTML={{ __html: `<style>${NO_JS_CSS}</style>` }} />,
  ]);
};
