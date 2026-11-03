import React from 'react';
import { expertise } from '../data/content';
import SectionHeading from './SectionHeading';
import { RevealItem, RevealList } from './Reveal';

export default function Expertise() {
  return (
    <section id="expertise">
      <SectionHeading index="02" kicker="expertise" title="What I work on" />
      <RevealList as="ol" className="expertise-grid">
        {expertise.map((item, index) => (
          <RevealItem className="expertise-card" key={item.title}>
            <p className="card-path">./0{index + 1}</p>
            <h3>{item.title}</h3>
            <p className="expertise-desc">{item.description}</p>
            <p className="tag">{item.tag}</p>
          </RevealItem>
        ))}
      </RevealList>
    </section>
  );
}
