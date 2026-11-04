import React from 'react';

/**
 * Section heading. The page nebula opens a clearing around the words only
 * (inline-block), so no full-width empty band cuts the background. No rule
 * under it and no eyebrow above it: the heading carries itself.
 */
export default function SectionHeading({ title }) {
  return (
    <header className="section-head">
      <h2 data-clearing="">{title}</h2>
    </header>
  );
}
