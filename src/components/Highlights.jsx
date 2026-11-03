import React from 'react';
import { highlights } from '../data/content';
import Counter from './Counter';
import { RevealItem, RevealList } from './Reveal';

export default function Highlights() {
  return (
    <div className="highlights">
      <p className="highlights-head">$ stats --impact</p>
      <RevealList as="ul" className="highlights-grid">
        {highlights.map((item) => (
          <RevealItem key={item.label} className="highlight">
            <span className="highlight-value">
              <Counter value={item.value} decimals={item.decimals} />
              <span className="highlight-suffix">{item.suffix}</span>
            </span>
            <span className="highlight-label">{item.label}</span>
          </RevealItem>
        ))}
      </RevealList>
    </div>
  );
}
