import React from 'react';
import { currentCity, facts, profile } from '../data/content';
import useWeather from '../hooks/useWeather';
import useReducedMotion from '../hooks/useReducedMotion';
import SectionHeading from './SectionHeading';
import WeatherBackdrop from './WeatherBackdrop';
import WeatherStatus from './WeatherStatus';

export default function About({ fetchImpl }) {
  const { weather, status, localTime } = useWeather(currentCity, fetchImpl);
  const reducedMotion = useReducedMotion();
  // Clouds while loading or offline: neutral, and still alive.
  const type = status === 'ready' ? weather.type : 'cloud';

  return (
    <section className="about" id="about">
      <WeatherBackdrop key={type} type={type} playing={!reducedMotion} />
      <div className="about-inner">
        <SectionHeading title="Hello, world" />
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
          <WeatherStatus city={currentCity} weather={weather} status={status} localTime={localTime} />
        </div>
      </div>
    </section>
  );
}
