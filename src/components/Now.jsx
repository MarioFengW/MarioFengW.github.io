import React, { useEffect, useState } from 'react';
import { now } from '../data/content';
import { asciiProgress } from '../lib/ascii';
import { semesterProgress } from '../lib/semester';
import SectionHeading from './SectionHeading';

const BAR_WIDTH = 32;

function progressLine({ week, progress, status }, weeks) {
  if (status === 'upcoming') return 'starts soon';
  if (status === 'done') return `${asciiProgress(1, BAR_WIDTH)}  term complete`;
  return `${asciiProgress(progress, BAR_WIDTH)}  week ${week}/${weeks}`;
}

/**
 * What I am doing this semester, as a terminal session: a live term progress
 * bar, the course list as `ls -l`, and the projects currently in progress.
 * The date is read after mount so the static HTML never shows a stale week.
 */
export default function Now({ date }) {
  const { semester, courses, building, place } = now;
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(semesterProgress(date || new Date(), semester.start, semester.weeks));
  }, [date, semester.start, semester.weeks]);

  return (
    <section id="now" className="now">
      <SectionHeading title="Right now" />
      <div className="now-term">
        <p className="now-line now-cmd">
          <span className="now-prompt" aria-hidden="true">$ </span>
          term --status <span className="now-arg">{semester.label}</span>
        </p>
        <p className="now-line now-place">{place}</p>
        <p className="now-line now-bar" aria-live="polite">
          {state ? progressLine(state, semester.weeks) : asciiProgress(0, BAR_WIDTH)}
        </p>

        <p className="now-line now-cmd">
          <span className="now-prompt" aria-hidden="true">$ </span>
          ls -l courses/
        </p>
        <ul className="now-courses">
          {courses.map((course) => (
            <li key={course.code}>
              <span className="now-perm" aria-hidden="true">-rw-r--r--</span>
              <span className="now-code">{course.code}</span>
              <span className="now-title">{course.title}</span>
            </li>
          ))}
        </ul>

        <p className="now-line now-cmd">
          <span className="now-prompt" aria-hidden="true">$ </span>
          ps aux | grep project
        </p>
        <ul className="now-building">
          {building.map((item) => (
            <li key={item}>
              <span className="now-run" aria-hidden="true">[running]</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
