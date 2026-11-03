import React from 'react';

/** Compact live readout that sits over the weather backdrop. */
export default function WeatherStatus({ city, weather, status, localTime }) {
  let reading = 'fetching…';
  if (status === 'ready') reading = weather.label;
  if (status === 'error') reading = 'weather offline';

  return (
    <aside className="weather-status" data-status={status} aria-label={`Weather in ${city.name}`}>
      <p className="weather-status-head">$ weather --city {city.name.toLowerCase()}</p>
      <p className="weather-status-temp" aria-hidden={status !== 'ready'}>
        {status === 'ready' ? weather.temperature : '--'}
        <span className="weather-status-unit">°C</span>
      </p>
      <dl className="weather-readout" aria-live="polite">
        <div><dt>city</dt><dd>{city.name}</dd></div>
        {/* Keyed by status so loading -> ready/offline crossfades instead of snapping. */}
        <div><dt>now</dt><dd key={status} className="fade-in">{reading}</dd></div>
        <div><dt>local</dt><dd>{localTime}</dd></div>
      </dl>
      <p className="weather-status-note">the background is the live sky over {city.name}</p>
    </aside>
  );
}
