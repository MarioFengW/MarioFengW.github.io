import React from 'react';
import ScrambleText from './ScrambleText';

/**
 * Section heading: the title decodes from glyphs the first time it is seen
 * (the real text is always there for assistive tech). The page nebula opens a
 * clearing around the words only, so no full-width band cuts the background.
 */
export default function SectionHeading({ title }) {
  return (
    <header className="section-head">
      <ScrambleText as="h2" text={title} data-clearing="" />
    </header>
  );
}
