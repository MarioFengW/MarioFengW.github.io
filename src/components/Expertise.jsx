import React, { useCallback, useRef, useState } from 'react';
import { expertise } from '../data/content';
import useScrollLinked from '../hooks/useScrollLinked';
import useReducedMotion from '../hooks/useReducedMotion';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { STAGE_SHAPES } from '../lib/stages';
import AsciiFlow from './AsciiFlow';
import NebulaBar from './NebulaBar';
import SectionHeading from './SectionHeading';

const PIPELINE_LINE = ['data', ...expertise.map((item) => item.node)].map((node) => `[ ${node} ]`).join(' ----> ');

/** How far through a pinned track (0..1) a section whose box is `rect` is. */
export function pinProgress(top, height, viewport) {
  const travel = height - viewport;
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, -top / travel));
}

/**
 * Horizontal scrollytelling: the section pins while vertical scroll slides the
 * three areas sideways along the pipeline. The step that is in front gives the
 * page nebula its shape (clusters, layers, containers). Under reduced motion
 * the steps simply stack, with no pin and no sideways travel.
 */
export default function Expertise() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const activeRef = useRef(0);
  const stepRef = useRef(-1);

  const update = useCallback((pin) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = pin.getBoundingClientRect();
    const p = pinProgress(rect.top, rect.height, window.innerHeight);
    // Travel until the last step sits where the first one started. offsetLeft is
    // in the track's own (unzoomed) pixels, the same space as translateX.
    const steps = track.children;
    const distance = steps.length > 1 ? Math.max(0, steps[steps.length - 1].offsetLeft - steps[0].offsetLeft) : 0;
    track.style.transform = `translateX(${-p * distance}px)`;
    const best = Math.round(p * (expertise.length - 1));
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
    const step = Math.round(p * 32);
    if (step !== stepRef.current) {
      stepRef.current = step;
      setProgress(step / 32);
    }
  }, []);
  useScrollLinked(pinRef, update, { enabled: !reducedMotion });

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
      <div className="stage-pin" ref={pinRef} style={{ '--steps': expertise.length }}>
        <div className="stage-viewport">
          <ol className="stage-steps" ref={trackRef}>
            {expertise.map((item, index) => (
              <li
                className={`stage-step${index === active ? ' is-active' : ''}`}
                key={item.title}
                data-index={index}
                data-clearing=""
              >
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
          <p className="stage-progress" data-clearing="">
            <span className="stage-progress-node">[ {current.node} ]</span>
            <NebulaBar progress={progress} width={24} />
          </p>
        </div>
      </div>
    </section>
  );
}
