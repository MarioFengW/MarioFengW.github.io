import React, { useEffect, useState } from 'react';
import { WEATHER_ART, fetchCurrentWeather, formatLocalTime } from '../lib/weather';
import useReducedMotion from '../hooks/useReducedMotion';

const FRAME_MS = 650;

/** Live weather for a fixed city, drawn as a two-frame ASCII animation. */
export default function AsciiWeather({ city, fetchImpl }) {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [frame, setFrame] = useState(0);
  const [localTime, setLocalTime] = useState('--:--');
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    fetchCurrentWeather(city, fetchImpl || window.fetch.bind(window))
      .then((result) => {
        if (cancelled) return;
        setWeather(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [city, fetchImpl]);

  useEffect(() => {
    const tick = () => setLocalTime(formatLocalTime(new Date(), city.timeZone));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [city.timeZone]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => setFrame((f) => (f + 1) % 2), FRAME_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const type = weather ? weather.type : 'cloud';
  const art = WEATHER_ART[type][reducedMotion ? 0 : frame];

  let reading = 'fetching…';
  if (status === 'ready') reading = `${weather.temperature}°C · ${weather.label}`;
  if (status === 'error') reading = 'weather offline';

  return (
    <figure className="weather" data-status={status} data-type={type}>
      <figcaption className="weather-head">$ weather --city {city.name.toLowerCase()}</figcaption>
      <pre className="weather-art" aria-hidden="true">{art.join('\n')}</pre>
      <dl className="weather-readout" aria-live="polite">
        <div><dt>city</dt><dd>{city.name}</dd></div>
        <div><dt>now</dt><dd>{reading}</dd></div>
        <div><dt>local</dt><dd>{localTime}</dd></div>
      </dl>
    </figure>
  );
}
