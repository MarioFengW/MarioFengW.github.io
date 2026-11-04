import React, { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '../data/content';
import { stackCover, stackDepth } from '../lib/scrollMath';
import useScrollLinked from '../hooks/useScrollLinked';
import useReducedMotion from '../hooks/useReducedMotion';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { PROJECT_SHAPES } from '../lib/stages';
import AsciiFlow from './AsciiFlow';
import SectionHeading from './SectionHeading';

export function slugify(title) {
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** "view source" for repositories, "visit site" for live products. */
export function ctaLabel(link) {
  return /^https:\/\/github\.com\//.test(link) ? 'view source' : 'visit site';
}

/**
 * Projects as a sticky stack: each card pins under the header and the next one
 * slides over it; the covered card recedes (shrinks, dims) in step with the
 * scroll. Under reduced motion the stack stays, without the depth effect.
 */
function finePointer() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export default function Projects() {
  // The hovered card's diagram runs at double speed (fine pointers only).
  const [hovered, setHovered] = useState(null);
  // The card on top of the stack: the last one whose top has reached the upper
  // part of the screen. It (or the hovered card) gives the page nebula its shape.
  const [onTop, setOnTop] = useState(0);
  const onTopRef = useRef(0);
  const pickOnTop = useCallback((stack) => {
    const line = window.innerHeight * 0.45;
    let top = 0;
    stack.querySelectorAll('.project-card').forEach((card, index) => {
      if (card.getBoundingClientRect().top <= line) top = index;
    });
    if (top !== onTopRef.current) {
      onTopRef.current = top;
      setOnTop(top);
    }
  }, []);
  const hoveredIndex = projects.findIndex((project) => project.title === hovered);
  const focusIndex = hoveredIndex >= 0 ? hoveredIndex : onTop;
  const focusProject = projects[focusIndex];
  useNebulaFocus('projects', {
    key: `project-${focusIndex}`,
    shape: PROJECT_SHAPES[focusIndex % PROJECT_SHAPES.length],
    label: `[ ${slugify(focusProject.title)} ] ${focusProject.shape}`,
  });
  const stackRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const update = useCallback((stack) => {
    const cards = [...stack.querySelectorAll('.project-card')];
    const rects = cards.map((card) => card.getBoundingClientRect());
    cards.forEach((card, index) => {
      const { scale, shade } = stackDepth(stackCover(rects[index], rects[index + 1]));
      card.querySelector('.project-inner').style.transform = `scale(${scale})`;
      card.querySelector('.project-shade').style.opacity = String(shade);
    });
  }, []);

  useScrollLinked(stackRef, update, { enabled: !reducedMotion });
  useScrollLinked(stackRef, pickOnTop);

  // The media query resolves after the first render: clear any depth already applied.
  useEffect(() => {
    if (!reducedMotion || !stackRef.current) return;
    stackRef.current.querySelectorAll('.project-inner').forEach((inner) => inner.style.removeProperty('transform'));
    stackRef.current.querySelectorAll('.project-shade').forEach((shade) => shade.style.removeProperty('opacity'));
  }, [reducedMotion]);

  return (
    <section id="projects">
      <SectionHeading title="Selected projects" />
      <ol className="project-stack" ref={stackRef}>
        {projects.map((project, index) => {
          const slug = slugify(project.title);
          return (
            <li className="project-card" key={project.title} style={{ '--i': index }}>
              <article
                className="project-inner"
                aria-labelledby={`project-${slug}`}
                onPointerEnter={() => finePointer() && setHovered(project.title)}
                onPointerLeave={() => setHovered(null)}
              >
                <span className="project-shade" aria-hidden="true" />
                <header className="project-top">
                  <span className="project-count">
                    {index + 1}/{projects.length}
                  </span>
                  <span className="project-path">./{slug}</span>
                  <span className="project-period">{project.period}</span>
                </header>
                <div className="project-body">
                  <div className="project-main">
                    <h3 className="project-title" id={`project-${slug}`}>{project.title}</h3>
                    <p className="project-context">{project.context}</p>
                    {project.metric && <p className="project-metric">{project.metric}</p>}
                    {project.diagram && <AsciiFlow lines={project.diagram} fast={hovered === project.title} />}
                  </div>
                  <div className="project-detail">
                    <p className="project-desc">{project.description}</p>
                    {project.stack && (
                      <ul className="stack" aria-label="Tech stack">
                        {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
                      </ul>
                    )}
                    <a className="project-cta" href={project.link} target="_blank" rel="noopener noreferrer">
                      <span className="sr-only">{project.title}: </span>
                      {ctaLabel(project.link)} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
