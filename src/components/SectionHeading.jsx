import React from 'react';
import ScrambleText from './ScrambleText';

/**
 * Section heading: the title decodes from glyphs the first time it is seen
 * (text is always present and readable; the effect only replaces characters),
 * No rule under it and no eyebrow above it: the heading carries itself.
 */
export default function SectionHeading({ title }) {
  return (
    <header className="section-head" data-clearing="">
      <ScrambleText as="h2" text={title} />
    </header>
  );
}
