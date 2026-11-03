import { describe, expect, it, vi } from 'vitest';
import {
  WEATHER_ART,
  WEATHER_LABELS,
  buildForecastUrl,
  fetchCurrentWeather,
  formatLocalTime,
  mapWeatherCode,
} from './weather';

const taipei = { latitude: 25.033, longitude: 121.5654 };

function okResponse(body) {
  return { ok: true, status: 200, json: async () => body };
}

describe('mapWeatherCode', () => {
  it.each([
    [0, 0, 1, 'sun'],
    [1, 0, 0, 'night'],
    [3, 0, 1, 'cloud'],
    [45, 0, 1, 'fog'],
    [61, 0, 1, 'rain'],
    [81, 0, 0, 'rain'],
    [73, 0, 1, 'snow'],
    [95, 0, 1, 'thunder'],
  ])('code %i (wind %i, day %i) -> %s', (code, wind, isDay, expected) => {
    expect(mapWeatherCode(code, wind, isDay)).toBe(expected);
  });

  it('strong wind wins over everything else', () => {
    expect(mapWeatherCode(95, 55, 1)).toBe('wind');
  });

  it('defaults to daytime clear sky', () => {
    expect(mapWeatherCode(0)).toBe('sun');
  });
});

describe('WEATHER_ART', () => {
  it('has a label and two equal-height frames for every condition', () => {
    Object.entries(WEATHER_ART).forEach(([type, frames]) => {
      expect(WEATHER_LABELS[type]).toBeTruthy();
      expect(frames).toHaveLength(2);
      expect(frames[0]).toHaveLength(frames[1].length);
    });
  });
});

describe('buildForecastUrl', () => {
  it('requests only the current fields we render', () => {
    const url = new URL(buildForecastUrl(taipei));
    expect(url.origin).toBe('https://api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('25.033');
    expect(url.searchParams.get('longitude')).toBe('121.5654');
    expect(url.searchParams.get('current')).toBe('temperature_2m,weather_code,wind_speed_10m,is_day');
  });
});

describe('fetchCurrentWeather', () => {
  it('returns a normalised reading', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      okResponse({ current: { temperature_2m: 23.6, weather_code: 61, wind_speed_10m: 5, is_day: 1 } })
    );
    await expect(fetchCurrentWeather(taipei, fetchImpl)).resolves.toEqual({
      type: 'rain',
      label: 'Rain',
      temperature: 24,
    });
    expect(fetchImpl).toHaveBeenCalledWith(buildForecastUrl(taipei));
  });

  it('throws on HTTP errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(fetchCurrentWeather(taipei, fetchImpl)).rejects.toThrow('503');
  });

  it('throws on an unexpected payload', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse({ error: true }));
    await expect(fetchCurrentWeather(taipei, fetchImpl)).rejects.toThrow('missing current');
  });

  it('propagates network failures', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchCurrentWeather(taipei, fetchImpl)).rejects.toThrow('Failed to fetch');
  });
});

describe('formatLocalTime', () => {
  it('formats a 24h clock in the requested zone', () => {
    const date = new Date('2026-01-01T00:30:00Z');
    expect(formatLocalTime(date, 'Asia/Taipei')).toBe('08:30');
    expect(formatLocalTime(date, 'UTC')).toBe('00:30');
  });
});
