import React, { useCallback, useRef, useState } from 'react';
import { expertise } from '../data/content';
import useScrollLinked from '../hooks/useScrollLinked';
import AsciiFlow from './AsciiFlow';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { STAGE_SHAPES } from '../lib/stages';
import SectionHeading from './SectionHeading';

const PIPELINE_LINE = ['data', ...expertise.map((item) => item.node)].map((node) => `[ ${node} ]`).join(' ----> ');

/**
 * Scrollytelling over the whole section: the nebula fills a sticky, full-bleed
 * background while three steps scroll over it. As each step reaches the middle
 * of the screen the gas re-forms into that area's shape (clusters, layers,
 * containers) on the side of the screen the text leaves free.
 */
export default function Expertise() {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const activeRef = useRef(0);

  // Every scroll frame (while on screen), the step whose centre is closest to
  // the middle of the viewport wins. Re-renders only when the winner changes.
  const update = useCallback((list) => {
    const mid = window.innerHeight / 2;
    const steps = [...list.querySelectorAll('.stage-step')];
    let best = 0;
    let bestDistance = Infinity;
    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);
  useScrollLinked(listRef, update);

  const current = expertise[active];
  useNebulaFocus('expertise', {
    key: `expertise-${active}`,
    shape: STAGE_SHAPES[active],
    label: `[ ${current.node} ] ${current.shape}`,
  });

  return (
    <section id="expertise" className="stages">
      <SectionHeading title="What I work on" />
      <AsciiFlow className="stage-pipeline" lines={[PIPELINE_LINE]} />
      <ol className="stage-steps" ref={listRef}>
        {expertise.map((item, index) => (
          <li
            className={`stage-step${index === active ? ' is-active' : ''}`}
            key={item.title}
            data-index={index}
          >
            <span className="stage-step-node" aria-hidden="true">[ {item.node} ]</span>
            <h3 className="stage-step-title">{item.title}</h3>
            <p className="stage-step-desc">{item.description}</p>
            <ul className="stage-step-evidence">
              {item.evidence.map((line) => (
                <li key={line}>
                  <span aria-hidden="true">&gt; </span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="stage-step-stack">{item.tag}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
