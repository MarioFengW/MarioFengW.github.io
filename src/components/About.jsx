import React from 'react';
import { currentCity, facts, profile } from '../data/content';
import useWeather from '../hooks/useWeather';
import useNebulaFocus from '../hooks/useNebulaFocus';
import { weatherGas } from '../lib/stages';
import SectionHeading from './SectionHeading';
import WeatherStatus from './WeatherStatus';

// One stable shape factory per weather type, so the gas only re-forms when the weather changes.
const WEATHER_SHAPES = {};
function weatherShape(type) {
  if (!WEATHER_SHAPES[type]) WEATHER_SHAPES[type] = weatherGas(type);
  return WEATHER_SHAPES[type];
}

export default function About({ fetchImpl }) {
  const { weather, status, localTime } = useWeather(currentCity, fetchImpl);
  // Clouds while loading or offline: neutral, and still alive.
  const type = status === 'ready' ? weather.type : 'cloud';
  const reading = status === 'ready' ? weather.label.toLowerCase() : 'clouds';
  useNebulaFocus('about', { key: `weather-${type}`, shape: weatherShape(type), label: `[ ${currentCity.name.toLowerCase()} ] ${reading}` });

  return (
    <section className="about" id="about" data-weather={type}>
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
