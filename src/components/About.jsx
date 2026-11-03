import React from 'react';
import { currentCity, facts, profile } from '../data/content';
import SectionHeading from './SectionHeading';
import AsciiWeather from './AsciiWeather';

export default function About() {
  return (
    <section className="about" id="about">
      <SectionHeading index="01" kicker="about" title="Hello, world" />
      <div className="about-grid">
        <div className="about-copy">
          <p className="about-intro">{profile.intro}</p>
          <dl className="facts">
            {facts.map((fact) => (
              <div key={fact.key}>
                <dt>{fact.key}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <AsciiWeather city={currentCity} />
      </div>
    </section>
  );
}
