import React, { useEffect, useRef, useState } from 'react';
import { expertise } from '../data/content';
import useReducedMotion from '../hooks/useReducedMotion';
import NebulaStage from './NebulaStage';
import SectionHeading from './SectionHeading';

const PIPELINE = ['data', ...expertise.map((item) => item.node)];

/**
 * Scrollytelling: a sticky nebula stage on one side, three steps on the other.
 * As each step reaches the middle of the screen it becomes active and the gas
 * re-forms into that area's shape (clusters, layers, containers).
 */
export default function Expertise() {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !('IntersectionObserver' in window)) return undefined;
    const steps = [...list.querySelectorAll('.stage-step')];
    // Whenever a step crosses the middle band, the step whose centre is closest
    // to the middle of the screen wins (robust to fast scrolls and skipped steps).
    const pick = () => {
      const mid = window.innerHeight / 2;
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
      setActive(best);
    };
    const observer = new IntersectionObserver(pick, { rootMargin: '-40% 0px -40% 0px' });
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  const current = expertise[active];

  return (
    <section id="expertise" className="stages">
      <SectionHeading title="What I work on" />
      <div className="stage-grid">
        <div className="stage-view">
          <div className="stage-frame">
            <NebulaStage stage={active} playing={!reducedMotion} />
            <p className="stage-caption" aria-hidden="true">
              <span className="stage-caption-node">[ {current.node} ]</span> {current.shape}
            </p>
          </div>
          <p className="stage-wire" aria-hidden="true">
            {PIPELINE.map((node, index) => (
              <React.Fragment key={node}>
                {index > 0 && <span className="stage-wire-link"> --&gt; </span>}
                <span className={index - 1 === active ? 'is-active' : undefined}>[ {node} ]</span>
              </React.Fragment>
            ))}
          </p>
        </div>
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
      </div>
    </section>
  );
}
