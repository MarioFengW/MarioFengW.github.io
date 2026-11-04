import React from 'react';
import { profile } from '../data/content';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { quietGas } from '../lib/stages';
import SectionHeading from './SectionHeading';

const RESUME_FOCUS = { key: 'resume', shape: quietGas, label: '[ resume ] one page, A4' };

/**
 * The resume on the page itself: a sharp preview of the one-page PDF (an image,
 * so it reads the same on every phone) with links to open and download the PDF.
 * The PDF is served from /static, so it never depends on a third-party viewer.
 */
export default function Resume() {
  useNebulaFocus('resume', RESUME_FOCUS);
  const file = profile.resume;

  return (
    <section id="resume" className="resume">
      <SectionHeading title="Resume" />
      <div className="resume-body">
        <a className="resume-sheet" href={file} target="_blank" rel="noopener noreferrer" data-clearing="">
          <img
            src="/resume-preview.png"
            width="1241"
            height="1754"
            loading="lazy"
            decoding="async"
            alt="Resume of Mario Feng Wu, one page: education at Tec de Monterrey and NTU, research and internship experience, projects, volunteering and skills."
          />
        </a>
        <div className="resume-side" data-clearing="">
          <p className="resume-note">
            One page: education, research, experience, projects, volunteering and skills. Updated September 2026.
          </p>
          <div className="resume-actions">
            <a className="btn btn-primary" href={file} download="Mario_Feng_Wu_Resume.pdf">
              <span aria-hidden="true">&gt;</span>
              <span>download pdf</span>
            </a>
            <a className="btn" href={file} target="_blank" rel="noopener noreferrer">
              <span>open in a new tab</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="resume-meta">PDF · 1 page · 140 KB</p>
        </div>
      </div>
    </section>
  );
}
