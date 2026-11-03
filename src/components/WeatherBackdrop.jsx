import React, { useCallback, useRef } from 'react';
import { renderWeatherField } from '../lib/weatherField';
import useAsciiLoop from '../hooks/useAsciiLoop';

/**
 * The current weather as a full-bleed ASCII scene behind the About section
 * (rain, snow, clouds, sun rays, fog, wind or stars). Decorative only.
 * Remount with a new `key` when the type changes.
 */
export default function WeatherBackdrop({ type = 'cloud', playing = true }) {
  const wrapRef = useRef(null);
  const preRef = useRef(null);

  const draw = useCallback(
    (cols, rows, t) => {
      const { text, flash } = renderWeatherField(type, cols, rows, t);
      if (preRef.current) preRef.current.textContent = text;
      wrapRef.current?.classList.toggle('is-flash', flash);
    },
    [type]
  );

  useAsciiLoop(wrapRef, preRef, draw, { playing, fps: 20 });

  return (
    <div ref={wrapRef} className="weather-backdrop" data-type={type} aria-hidden="true">
      <pre ref={preRef} className="weather-backdrop-pre" />
    </div>
  );
}
