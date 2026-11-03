// Weather for a fixed location (no geolocation prompt, no reverse geocoding).

export const WEATHER_LABELS = {
  sun: 'Clear sky',
  night: 'Clear night',
  cloud: 'Cloudy',
  fog: 'Foggy',
  rain: 'Rain',
  thunder: 'Thunderstorm',
  snow: 'Snow',
  wind: 'Windy',
};

// Two frames per condition; the widget alternates between them.
export const WEATHER_ART = {
  sun: [
    ['    \\   /    ', '     .-.     ', '  - (   ) -  ', "     `-'     ", '    /   \\    '],
    ['     \\ /     ', '   - .-. -   ', ' -- (   ) -- ', "   - `-' -   ", '     / \\     '],
  ],
  night: [
    ['  *     .-.  ', '     . (   ) ', "  .    `-'   ", '     *    .  ', ' .       *   '],
    ['  .     .-.  ', '     * (   ) ', "  *    `-'   ", '     .    *  ', ' *       .   '],
  ],
  cloud: [
    ['             ', '     .--.    ', '  .-(    ).  ', ' (___.__)__) ', '             '],
    ['             ', '    .--.     ', ' .-(    ).   ', '(___.__)__)  ', '             '],
  ],
  fog: [
    ['             ', ' _ - _ - _ - ', '  _ - _ - _  ', ' _ - _ - _ - ', '             '],
    ['             ', '  _ - _ - _  ', ' _ - _ - _ - ', '  _ - _ - _  ', '             '],
  ],
  rain: [
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', "    ,',',',  ", "    ,',',',  "],
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', "   ',',','   ", "   ',',','   "],
  ],
  thunder: [
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', "    ,'/,',   ", "    ,/',',   "],
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', "   ',',\\'    ", "   ',','\\    "],
  ],
  snow: [
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', '    *  *  *  ', '   *  *  *   '],
    ['     .-.     ', '    (   ).   ', '   (___(__)  ', '   *  *  *   ', '    *  *  *  '],
  ],
  wind: [
    ['             ', ' ~~~~~~~~    ', '   ~~~~~~~~~ ', ' ~~~~~~      ', '             '],
    ['             ', '  ~~~~~~~~   ', ' ~~~~~~~~~   ', '   ~~~~~~    ', '             '],
  ],
};

const THUNDER = [95, 96, 99];
const SNOW = [71, 73, 75, 77, 85, 86];
const RAIN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
const FOG = [45, 48];
const CLOUD = [2, 3];

/** Map an Open-Meteo WMO weather code to one of the WEATHER_ART keys. */
export function mapWeatherCode(code, windSpeedKmh = 0, isDay = 1) {
  if (windSpeedKmh >= 40) return 'wind';
  if (THUNDER.includes(code)) return 'thunder';
  if (SNOW.includes(code)) return 'snow';
  if (RAIN.includes(code)) return 'rain';
  if (FOG.includes(code)) return 'fog';
  if (CLOUD.includes(code)) return 'cloud';
  return isDay ? 'sun' : 'night';
}

export function buildForecastUrl({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
    timezone: 'auto',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

/** Fetch current conditions. Throws on network/HTTP/shape errors so the caller can fall back. */
export async function fetchCurrentWeather(location, fetchImpl = fetch) {
  const response = await fetchImpl(buildForecastUrl(location));
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
  const data = await response.json();
  const current = data && data.current;
  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('Weather response missing current conditions');
  }
  const type = mapWeatherCode(current.weather_code, current.wind_speed_10m, current.is_day);
  return {
    type,
    label: WEATHER_LABELS[type],
    temperature: Math.round(current.temperature_2m),
  };
}

/** "14:05" style local time in a given IANA zone. */
export function formatLocalTime(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
}
