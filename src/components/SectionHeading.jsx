import React from 'react';
import ScrambleText from './ScrambleText';
import { DrawRule } from './Reveal';

export default function SectionHeading({ index, kicker, title }) {
  return (
    <header className="section-head">
      <p className="kicker">
        <span className="kicker-index">{index}</span>
        <span className="kicker-path">~/{kicker}</span>
      </p>
      <ScrambleText as="h2" text={title} />
      <DrawRule />
    </header>
  );
}
