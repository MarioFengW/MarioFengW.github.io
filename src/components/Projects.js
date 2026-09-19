import React from 'react';
import { projects } from '../data/content';
import SectionHeading from './SectionHeading';

export default function Projects() {
  return (
    <section id="projects">
      <SectionHeading kicker="work">Selected Projects</SectionHeading>
      <div className="projects">
        {projects.map((project, index) => (
          <article className={`project project-${index + 1}`} key={project.title}>
            <a
              className="project-link"
              href={project.link || '#contact'}
              aria-label={`View ${project.title}`}
            >
              <div className="project-label">.project#selected_{index}</div>
              <div className="project-category">{project.context || 'selected work'}</div>
              <svg className="project-arrow" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M8 24 24 8M11 8h13v13" />
              </svg>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.stack && (
                <div className="stack">
                  {project.stack.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
              )}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
