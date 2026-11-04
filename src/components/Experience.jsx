import React, { useCallback, useRef, useState } from 'react';
import { experience } from '../data/content';
import { timelineProgress } from '../lib/scrollMath';
import useScrollLinked from '../hooks/useScrollLinked';
import useReducedMotion from '../hooks/useReducedMotion';
import { EXPERIENCE_SHAPES } from '../lib/stages';
import NebulaStage from './NebulaStage';
import ScrambleText from './ScrambleText';
import SectionHeading from './SectionHeading';

/**
 * Career as a timeline: the rail fills as you scroll through it and each
 * milestone lights up once the line reaches it. Entries open as an accordion
 * (pure CSS grid-rows transition; closed panels are inert).
 *
 * Behind it, the page's nebula takes the shape of the role in focus: the
 * hovered entry (fine pointers), otherwise the open one.
 */
function finePointer() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default function Experience() {
  const [openIndex, setOpenIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const reducedMotion = useReducedMotion();
  const focus = hoverIndex ?? (openIndex >= 0 ? openIndex : 0);
  const timelineRef = useRef(null);
  const progressRef = useRef(null);
  const packetRef = useRef(null);
  const passedRef = useRef([]);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  const update = useCallback((timeline) => {
    // Read everything first, then write: no layout thrashing.
    const rect = timeline.getBoundingClientRect();
    const progress = timelineProgress(rect.top, rect.height, window.innerHeight);
    const reach = rect.top + progress * rect.height;
    const items = [...timeline.querySelectorAll('.exp-item')];
    const nodeCenters = items.map((item) => {
      const node = item.querySelector('.exp-node').getBoundingClientRect();
      return node.top + node.height / 2;
    });
    progressRef.current.style.transform = `scaleY(${progress})`;
    // A packet of light rides the tip of the line; a milestone pings once as it is reached.
    if (packetRef.current) packetRef.current.style.transform = `translateY(${reach - rect.top}px)`;
    items.forEach((item, index) => {
      const passed = nodeCenters[index] <= reach;
      item.toggleAttribute('data-passed', passed);
      if (passed && passedRef.current[index] === false) {
        const node = item.querySelector('.exp-node');
        node.classList.remove('is-ping');
        void node.offsetWidth; // restart the animation if it is still running
        node.classList.add('is-ping');
      }
      passedRef.current[index] = passed;
    });
  }, []);

  useScrollLinked(timelineRef, update);

  return (
    <section id="experience" className="exp-section">
      <SectionHeading title="Experience" />
      <div className="stage-bg" aria-hidden="true">
        <NebulaStage stage={focus} shapes={EXPERIENCE_SHAPES} side="right" playing={!reducedMotion} />
        <div className="stage-hud">
          <p className="stage-caption">
            <ScrambleText key={focus} text={`[ ${experience[focus].organization.toLowerCase()} ] ${experience[focus].shape}`} immediate />
          </p>
        </div>
      </div>
      <div className="exp-timeline" ref={timelineRef}>
        <span className="exp-rail" aria-hidden="true">
          <span className="exp-progress" ref={progressRef} />
          <span className="exp-packet" ref={packetRef}>*</span>
        </span>
        <ol className="exp-log">
          {experience.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `experience-panel-${index}`;
            return (
              <li
                className={`exp-item${isOpen ? ' is-open' : ''}`}
                key={`${item.period}-${item.title}`}
                onPointerEnter={() => finePointer() && setHoverIndex(index)}
                onPointerLeave={() => setHoverIndex(null)}
              >
                <h3 className="exp-heading">
                  <button
                    type="button"
                    className="exp-header"
                    onClick={() => toggle(index)}
                    aria-controls={panelId}
                    aria-expanded={isOpen}
                  >
                    <span className="exp-node" aria-hidden="true" />
                    <span className="exp-title">
                      {item.title} <span className="exp-at">@ {item.organization}</span>
                    </span>
                    {item.metric && <span className="exp-metric">{item.metric}</span>}
                    <span className="exp-period">{item.period}</span>
                    <span className="exp-icon" aria-hidden="true">{isOpen ? '[-]' : '[+]'}</span>
                  </button>
                </h3>
                <div className="exp-panel" id={panelId} role="region" aria-label={item.title} inert={isOpen ? undefined : ''}>
                  <div className="exp-panel-inner">
                    <div className="exp-meta">
                      {item.location && <span>{item.location}</span>}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.linkLabel || item.link} <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                    <p className="exp-desc">{item.description}</p>
                    {item.stack && (
                      <ul className="stack" aria-label="Tech stack">
                        {item.stack.map((tech) => <li key={tech}>{tech}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
