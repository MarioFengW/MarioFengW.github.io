import React from 'react';
import { currentCity, facts, profile } from '../data/content';
import SectionHeading from './SectionHeading';
import AsciiWeather from './AsciiWeather';
import Highlights from './Highlights';
import { Reveal, RevealItem, RevealList } from './Reveal';

export default function About() {
  return (
    <section className="about" id="about">
      <SectionHeading index="01" kicker="about" title="Hello, world" />
      <div className="about-grid">
        <div className="about-copy">
          <Reveal as="p" className="about-intro">{profile.intro}</Reveal>
          <RevealList as="dl" className="facts">
            {facts.map((fact) => (
              <RevealItem as="div" key={fact.key}>
                <dt>{fact.key}</dt>
                <dd>{fact.value}</dd>
              </RevealItem>
            ))}
          </RevealList>
        </div>
        <Reveal>
          <AsciiWeather city={currentCity} />
        </Reveal>
      </div>
      <Highlights />
    </section>
  );
}
