import React from 'react';
import { projects } from '../data/content';
import SectionHeading from './SectionHeading';

export function slugify(title) {
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Projects() {
  return (
    <section id="projects">
      <SectionHeading index="04" kicker="projects" title="Selected projects" />
      <ul className="projects">
        {projects.map((project) => (
          <li className="project" key={project.title}>
            <a className="project-link" href={project.link} target="_blank" rel="noopener noreferrer">
              <span className="project-top">
                <span className="project-path">./{slugify(project.title)}</span>
                <span className="project-period">{project.period}</span>
              </span>
              <span className="project-context">{project.context}</span>
              <h3 className="project-title">
                {project.title} <span className="project-arrow" aria-hidden="true">↗</span>
              </h3>
              <span className="project-desc">{project.description}</span>
              {project.stack && (
                <span className="stack" aria-label="Tech stack">
                  {project.stack.map((tech) => <span key={tech}>{tech}</span>)}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
