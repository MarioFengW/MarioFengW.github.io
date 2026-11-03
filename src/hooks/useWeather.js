import { useEffect, useState } from 'react';
import { fetchCurrentWeather, formatLocalTime } from '../lib/weather';

/** Live weather + local clock for a fixed city. status: 'loading' | 'ready' | 'error'. */
export default function useWeather(city, fetchImpl) {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');
  const [localTime, setLocalTime] = useState('--:--');

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

  return { weather, status, localTime };
}
