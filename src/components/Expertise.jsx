import React from 'react';
import { expertise } from '../data/content';
import SectionHeading from './SectionHeading';

const PIPELINE = ['data', ...expertise.map((item) => item.node)];

/**
 * Areas of work as one pipeline: data flows into a model, the model into an
 * app, the app into a deployment. Each row below is one stage of that wire.
 */
export default function Expertise() {
  return (
    <section id="expertise">
      <SectionHeading title="What I work on" />
      <div className="pipeline" aria-hidden="true">
        <pre className="pipeline-wire">{PIPELINE.map((node) => `[ ${node} ]`).join(' ----> ')}</pre>
        <span className="pipeline-packet" />
      </div>
      <ul className="expertise-list">
        {expertise.map((item) => (
          <li className="expertise-row" key={item.title}>
            <span className="expertise-node" aria-hidden="true">[ {item.node} ]</span>
            <h3 className="expertise-title">{item.title}</h3>
            <p className="expertise-desc">{item.description}</p>
            <p className="expertise-stack">{item.tag}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
