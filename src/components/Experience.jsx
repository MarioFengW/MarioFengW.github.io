import React, { useState } from 'react';
import { experience } from '../data/content';
import SectionHeading from './SectionHeading';

export default function Experience() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section id="experience">
      <SectionHeading index="03" kicker="experience" title="Experience" />
      <ol className="exp-log">
        {experience.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `experience-panel-${index}`;
          return (
            <li className={`exp-item${isOpen ? ' is-open' : ''}`} key={`${item.period}-${item.title}`}>
              <h3 className="exp-heading">
                <button
                  type="button"
                  className="exp-header"
                  onClick={() => toggle(index)}
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                >
                  <span className="exp-node" aria-hidden="true">{isOpen ? '●' : '○'}</span>
                  <span className="exp-title">
                    {item.title} <span className="exp-at">@ {item.organization}</span>
                  </span>
                  <span className="exp-period">{item.period}</span>
                  <span className="exp-icon" aria-hidden="true">{isOpen ? '[-]' : '[+]'}</span>
                </button>
              </h3>
              <div className="exp-panel" id={panelId} role="region" aria-label={item.title} hidden={!isOpen}>
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
            </li>
          );
        })}
      </ol>
    </section>
  );
}
