import React from 'react';
import { expertise } from '../data/content';
import SectionHeading from './SectionHeading';

/** Areas of work as rows (title · what · stack), not a row of identical cards. */
export default function Expertise() {
  return (
    <section id="expertise">
      <SectionHeading title="What I work on" />
      <ul className="expertise-list">
        {expertise.map((item) => (
          <li className="expertise-row" key={item.title}>
            <h3 className="expertise-title">{item.title}</h3>
            <p className="expertise-desc">{item.description}</p>
            <p className="expertise-stack">{item.tag}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
