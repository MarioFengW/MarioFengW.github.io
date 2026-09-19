import React, { useState } from 'react';
import { experience } from '../data/content';
import SectionHeading from './SectionHeading';

export default function Experience() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  return (
    <section id="experience">
      <SectionHeading kicker="experience">Professional Experience</SectionHeading>
      <div className="exp-accordion">
        {experience.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `experience-panel-${index}`;

          return (
            <article className={`exp-item ${isOpen ? 'is-open' : ''}`} key={`${item.period}-${item.title}`}>
              <button
                type="button"
                className="exp-header"
                onClick={() => toggle(index)}
                aria-controls={panelId}
                aria-expanded={isOpen}
              >
                <span className="exp-title">{item.title} @ {item.organization}</span>
                <span className="exp-right">
                  <span className="exp-period">{item.period}</span>
                  <span className="exp-icon" aria-hidden="true">+</span>
                </span>
              </button>

              <div className="exp-panel-wrap">
                <div className="exp-panel" id={panelId}>
                  <div className="exp-panel-inner">
                    {(item.location || item.link) && (
                      <div className="exp-meta">
                        {item.location && <span className="exp-meta-item">{item.location}</span>}
                        {item.link && (
                          <a className="exp-meta-item exp-link" href={item.link} target="_blank" rel="noopener noreferrer">
                            {item.linkLabel || item.link}
                          </a>
                        )}
                      </div>
                    )}
                    <p className="exp-desc">{item.description}</p>
                    {item.stack && (
                      <div className="stack">
                        {item.stack.map((technology) => <span key={technology}>{technology}</span>)}
                      </div>
                    )}
                    {item.logo && (
                      <div className="exp-logo-wrap">
                        <img src={item.logo} alt={`${item.organization} logo`} className="exp-logo" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
