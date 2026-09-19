import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { profile } from '../data/content';

gsap.registerPlugin(MotionPathPlugin);

/**
 * Fiel 1:1 al CodePen original (https://codepen.io/ste-vg/pen/GqaZbo)
 * Portado de jQuery + Snap.svg + TweenMax  ->  React + refs + GSAP
 *
 * npm install gsap
 *
 * Toda la lógica de dibujo de nubes (bezier), lluvia, nieve, hojas y rayo
 * es la misma que el script original; solo cambia cómo se accede al DOM
 * (refs de React en vez de selectores jQuery/Snap) y TweenMax -> gsap.
 */

const NS = 'http://www.w3.org/2000/svg';

const WEATHER = [
  { type: 'snow', name: 'Snow', icon: 'wi-snow' },
  { type: 'wind', name: 'Windy', icon: 'wi-strong-wind' },
  { type: 'rain', name: 'Rain', icon: 'wi-rain' },
  { type: 'thunder', name: 'Storms', icon: 'wi-lightning' },
  { type: 'sun', name: 'Sunny', icon: 'wi-day-sunny' },
  { type: 'night', name: 'Clear Night', icon: 'wi-night-clear' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Maps the WMO weather code used by Open-Meteo to a widget state.
// https://open-meteo.com/en/docs -> WMO Weather interpretation codes
function mapWeatherCode(code, windSpeedKmh, isDay) {
  if (windSpeedKmh >= 40) return 'wind';
  if ([95, 96, 99].includes(code)) return 'thunder';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if (!isDay && [0, 1, 2, 3, 45, 48].includes(code)) return 'night';
  return 'sun'; // 0,1,2,3 clear/partly cloudy, 45/48 fog -> tratamos como soleado/despejado
}

async function fetchLocationWeather(latitude, longitude) {
  const forecastRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
  );
  const forecastData = await forecastRes.json();
  const current = forecastData.current;

  const geoRes = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  const geoData = await geoRes.json();

  const type = mapWeatherCode(current.weather_code, current.wind_speed_10m, current.is_day);
  const now = new Date(current.time);

  return {
    cityLabel: [geoData.city, geoData.principalSubdivision, geoData.countryName]
      .filter(Boolean)
      .join(', ') || 'Current location',
    temperature: Math.round(current.temperature_2m),
    dateLabel: `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`,
    weather: WEATHER.find((w) => w.type === type) || WEATHER[4],
  };
}

function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

export default function WeatherCards() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const innerSvgRef = useRef(null);
  const outerSvgRef = useRef(null);
  const backSvgRef = useRef(null);
  const summaryRef = useRef(null);
  const sunRef = useRef(null);
  const sunburstRef = useRef(null);
  const cloud1Ref = useRef(null);
  const cloud2Ref = useRef(null);
  const cloud3Ref = useRef(null);
  const leafTemplateRef = useRef(null);
  const [cityLabel, setCityLabel] = React.useState('Detecting location...');
  const [temperature, setTemperature] = React.useState(20);
  const [dateLabel, setDateLabel] = React.useState('Loading weather...');

  function applyWeatherResult(result) {
    setCityLabel(result.cityLabel);
    setTemperature(result.temperature);
    setDateLabel(result.dateLabel);
    containerRef.current?._changeWeather?.(result.weather);
  }

  async function loadLocation(position) {
    try {
      const result = await fetchLocationWeather(position.coords.latitude, position.coords.longitude);
      applyWeatherResult(result);
    } catch (err) {
      setCityLabel('Weather unavailable');
    }
  }

  function loadFallbackWeather() {
    const now = new Date();
    setDateLabel(`${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`);
    setCityLabel('Enable location access to see local weather');
    containerRef.current?._changeWeather?.(WEATHER.find((weather) => weather.type === 'thunder'));
  }

  function loadAutomaticWeather() {
    const now = new Date();
    setDateLabel(`${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`);

    if (!navigator.geolocation) {
      loadFallbackWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      loadLocation,
      loadFallbackWeather,
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const innerSVG = innerSvgRef.current;
    const outerSVG = outerSvgRef.current;
    const backSVG = backSvgRef.current;
    const summary = summaryRef.current;
    const sun = sunRef.current;
    const sunburst = sunburstRef.current;

    // groups created dynamically inside the layers, same as Snap .group()
    const layer1 = document.getElementById('wc-layer1');
    const layer2 = document.getElementById('wc-layer2');
    const layer3 = document.getElementById('wc-layer3');

    const innerRainHolder1 = el('g'); layer1.appendChild(innerRainHolder1);
    const innerRainHolder2 = el('g'); layer2.appendChild(innerRainHolder2);
    const innerRainHolder3 = el('g'); layer3.appendChild(innerRainHolder3);
    const innerLeafHolder = el('g'); layer1.appendChild(innerLeafHolder);
    const innerSnowHolder = el('g'); layer1.appendChild(innerSnowHolder);

    const outerSplashHolder = el('g'); outerSVG.appendChild(outerSplashHolder);
    const outerLeafHolder = el('g'); outerSVG.appendChild(outerLeafHolder);
    const outerSnowHolder = el('g'); outerSVG.appendChild(outerSnowHolder);
    const leafMask = el('rect');
    const clipPath = el('clipPath', { id: 'wc-leaf-clip' });
    clipPath.appendChild(leafMask);
    outerSVG.appendChild(clipPath);
    outerLeafHolder.setAttribute('clip-path', 'url(#wc-leaf-clip)');

    const clouds = [
      { group: cloud1Ref.current, path: null, offset: 0 },
      { group: cloud2Ref.current, path: null, offset: 0 },
      { group: cloud3Ref.current, path: null, offset: 0 },
    ];

    const settings = {
      windSpeed: 2,
      rainCount: 0,
      leafCount: 0,
      snowCount: 0,
      cloudHeight: 100,
      cloudSpace: 30,
      cloudArch: 50,
      renewCheck: 10,
    };

    const sizes = { container: { width: 0, height: 0 }, card: { width: 0, height: 0 } };
    let rain = [];
    let leafs = [];
    let snow = [];
    let tickCount = 0;
    let currentWeather = WEATHER[0];
    let lightningTimeout;
    let rafId;
    let destroyed = false;
    let resizeObserver;

    function onResize() {
      const cRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      sizes.container.width = cRect.width;
      sizes.container.height = cRect.height;
      sizes.card.width = cardRect.width;
      sizes.card.height = cardRect.height;
      sizes.card.offset = { left: cardRect.left - cRect.left, top: cardRect.top - cRect.top };

      innerSVG.setAttribute('width', sizes.card.width);
      innerSVG.setAttribute('height', sizes.card.height);
      outerSVG.setAttribute('width', sizes.container.width);
      outerSVG.setAttribute('height', sizes.container.height);
      backSVG.setAttribute('width', sizes.container.width);
      backSVG.setAttribute('height', sizes.container.height);

      gsap.set(sunburst, {
        transformOrigin: '50% 50%',
        x: sizes.container.width / 2,
        y: sizes.card.height / 2 + sizes.card.offset.top,
      });

      leafMask.setAttribute('x', sizes.card.offset.left);
      leafMask.setAttribute('y', 0);
      leafMask.setAttribute('width', sizes.container.width - sizes.card.offset.left);
      leafMask.setAttribute('height', sizes.container.height);

      for (let i = 0; i < clouds.length; i++) drawCloud(clouds[i], i);
    }

    function drawCloud(cloud, i) {
      const space = settings.cloudSpace * i;
      const height = space + settings.cloudHeight;
      const arch = height + settings.cloudArch + Math.random() * settings.cloudArch;
      const width = sizes.card.width;

      const points = [];
      points.push('M' + [-width, 0].join(','));
      points.push([width, 0].join(','));
      points.push('Q' + [width * 2, height / 2].join(','));
      points.push([width, height].join(','));
      points.push('Q' + [width * 0.5, arch].join(','));
      points.push([0, height].join(','));
      points.push('Q' + [width * -0.5, arch].join(','));
      points.push([-width, height].join(','));
      points.push('Q' + [-(width * 2), height / 2].join(','));
      points.push([-width, 0].join(','));

      if (!cloud.path) {
        cloud.path = el('path');
        cloud.group.appendChild(cloud.path);
      }
      cloud.path.setAttribute('d', points.join(' '));
    }

    function makeRain() {
      const lineWidth = Math.random() * 3;
      const lineLength = currentWeather.type === 'thunder' ? 35 : 14;
      const x = Math.random() * (sizes.card.width - 40) + 20;
      const holder = [innerRainHolder3, innerRainHolder2, innerRainHolder1][Math.floor(lineWidth)];

      const line = el('path', {
        d: `M0,0 0,${lineLength}`,
        fill: 'none',
        stroke: currentWeather.type === 'thunder' ? '#777' : '#0000ff',
        'stroke-width': lineWidth,
      });
      holder.appendChild(line);
      rain.push(line);

      gsap.fromTo(
        line,
        { x, y: -lineLength },
        {
          y: sizes.card.height,
          delay: Math.random(),
          duration: 1,
          ease: 'power2.in',
          onComplete: onRainEnd,
          onCompleteParams: [line, lineWidth, x, currentWeather.type],
        }
      );
    }

    function onRainEnd(line, width, x, type) {
      line.remove();
      rain = rain.filter((l) => l !== line);
      if (destroyed) return;
      if (rain.length < settings.rainCount) {
        makeRain();
        if (width > 2) makeSplash(x, type);
      }
    }

    function makeSplash(x, type) {
      const splashLength = type === 'thunder' ? 30 : 20;
      const splashBounce = type === 'thunder' ? 120 : 100;
      const splashDistance = 80;
      const speed = type === 'thunder' ? 0.7 : 0.5;
      const splashUp = -(Math.random() * splashBounce);
      const randomX = Math.random() * splashDistance - splashDistance / 2;

      const points = ['M0,0', `Q${randomX},${splashUp}`, `${randomX * 2},${splashDistance}`];
      const splash = el('path', {
        d: points.join(' '),
        fill: 'none',
        stroke: type === 'thunder' ? '#777' : '#0000ff',
        'stroke-width': 1,
      });
      outerSplashHolder.appendChild(splash);

      const pathLength = splash.getTotalLength();
      const xOffset = sizes.card.offset.left;
      const yOffset = sizes.card.offset.top + sizes.card.height;
      splash.style.strokeDasharray = `${splashLength} ${pathLength}`;

      gsap.fromTo(
        splash,
        { strokeWidth: 2, y: yOffset, x: xOffset + 20 + x, opacity: 1, strokeDashoffset: splashLength },
        {
          strokeWidth: 0,
          strokeDashoffset: -pathLength,
          opacity: 1,
          duration: speed,
          ease: 'slow(0.4, 0.1, false)',
          onComplete: () => splash.remove(),
        }
      );
    }

    function makeLeaf() {
      const scale = 0.5 + Math.random() * 0.5;
      const areaY = sizes.card.height / 2;
      let y = areaY + Math.random() * areaY;
      let endY = y - (Math.random() * (areaY * 2) - areaY);
      const colors = ['#76993E', '#4A5E23', '#6D632F'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      let x, xBezier, endX, holder;

      if (scale > 0.8) {
        holder = outerLeafHolder;
        y += sizes.card.offset.top / 2;
        endY += sizes.card.offset.top / 2;
        x = sizes.card.offset.left - 100;
        xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
        endX = sizes.container.width + 50;
      } else {
        holder = innerLeafHolder;
        x = -100;
        xBezier = sizes.card.width / 2;
        endX = sizes.card.width + 50;
      }

      const leaf = leafTemplateRef.current.cloneNode(true);
      leaf.removeAttribute('id');
      leaf.setAttribute('fill', color);
      holder.appendChild(leaf);
      leafs.push(leaf);

      gsap.fromTo(
        leaf,
        { rotation: Math.random() * 180, x, y, scale },
        {
          rotation: Math.random() * 360,
          motionPath: {
            path: [
              { x, y },
              { x: xBezier, y: Math.random() * endY + endY / 3 },
              { x: endX, y: endY },
            ],
            curviness: 1.5,
          },
          duration: 2,
          ease: 'power0.in',
          onComplete: onLeafEnd,
          onCompleteParams: [leaf],
        }
      );
    }

    function onLeafEnd(leaf) {
      leaf.remove();
      leafs = leafs.filter((l) => l !== leaf);
      if (destroyed) return;
      if (leafs.length < settings.leafCount) makeLeaf();
    }

    function makeSnow() {
      const scale = 0.5 + Math.random() * 0.5;
      let x = 20 + Math.random() * (sizes.card.width - 40);
      let y = -10;
      let endY, holder;

      if (scale > 0.8) {
        holder = outerSnowHolder;
        endY = sizes.container.height + 10;
        y = sizes.card.offset.top + settings.cloudHeight;
        x += sizes.card.offset.left;
      } else {
        holder = innerSnowHolder;
        endY = sizes.card.height + 10;
      }

      const flake = el('circle', { cx: 0, cy: 0, r: 5, fill: 'white' });
      holder.appendChild(flake);
      snow.push(flake);

      gsap.fromTo(flake, { x, y }, { y: endY, duration: 3 + Math.random() * 5, ease: 'power0.in', onComplete: onSnowEnd, onCompleteParams: [flake] });
      gsap.fromTo(flake, { scale: 0 }, { scale, duration: 1, ease: 'power1.inOut' });
      gsap.to(flake, { x: x + (Math.random() * 150 - 75), duration: 3, repeat: -1, yoyo: true, ease: 'power1.inOut' });
    }

    function onSnowEnd(flake) {
      flake.remove();
      snow = snow.filter((f) => f !== flake);
      if (destroyed) return;
      if (snow.length < settings.snowCount) makeSnow();
    }

    function tick() {
      tickCount++;
      if (tickCount % settings.renewCheck) {
        if (rain.length < settings.rainCount) makeRain();
        if (leafs.length < settings.leafCount) makeLeaf();
        if (snow.length < settings.snowCount) makeSnow();
      }

      for (let i = 0; i < clouds.length; i++) {
        const cw = sizes.card.width;
        if (currentWeather.type === 'sun') {
          if (clouds[i].offset > -(cw * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
          if (clouds[i].offset > cw * 2.5) clouds[i].offset = -(cw * 1.5);
        } else {
          clouds[i].offset += settings.windSpeed / (i + 1);
          if (clouds[i].offset > cw) clouds[i].offset = clouds[i].offset - cw;
        }
        clouds[i].group.setAttribute('transform', `translate(${clouds[i].offset},0)`);
      }

      rafId = requestAnimationFrame(tick);
    }

    function reset() {
      WEATHER.forEach((w) => container.classList.remove(w.type));
    }

    function updateSummaryText() {
      summary.textContent = currentWeather.name;
      gsap.fromTo(summary, { x: 30 }, { opacity: 1, x: 0, duration: 1.5, ease: 'power4.out' });
    }

    function startLightningTimer() {
      if (lightningTimeout) clearTimeout(lightningTimeout);
      if (currentWeather.type === 'thunder') {
        lightningTimeout = setTimeout(lightning, Math.random() * 6000);
      }
    }

    function lightning() {
      startLightningTimer();
      gsap.fromTo(card, { y: -30 }, { y: 0, duration: 0.75, ease: 'elastic.out' });

      const pathX = 30 + Math.random() * (sizes.card.width - 60);
      const yOffset = 20;
      const steps = 20;
      const points = [pathX + ',0'];
      for (let i = 0; i < steps; i++) {
        const x = pathX + (Math.random() * yOffset - yOffset / 2);
        const y = (sizes.card.height / steps) * (i + 1);
        points.push(x + ',' + y);
      }

      const strike = el('path', { d: 'M' + points.join(' '), fill: 'none', stroke: 'white', 'stroke-width': 2 + Math.random() });
      layer1.appendChild(strike);
      gsap.to(strike, { opacity: 0, duration: 1, ease: 'power4.out', onComplete: () => strike.remove() });
    }

    function changeWeather(weather) {
      reset();

      gsap.killTweensOf(settings);
      settings.rainCount = 0;
      settings.leafCount = 0;
      settings.snowCount = 0;
      [...rain].forEach((line) => { gsap.killTweensOf(line); line.remove(); });
      rain = [];
      [...leafs].forEach((leaf) => { gsap.killTweensOf(leaf); leaf.remove(); });
      leafs = [];
      [...snow].forEach((flake) => { gsap.killTweensOf(flake); flake.remove(); });
      snow = [];

      currentWeather = weather;

      gsap.killTweensOf(summary);
      gsap.to(summary, { opacity: 0, x: -30, duration: 1, ease: 'power4.in', onComplete: updateSummaryText });

      container.classList.add(weather.type);

      gsap.to(settings, { windSpeed: weather.type === 'wind' ? 3 : weather.type === 'sun' ? 20 : 0.5, duration: 3, ease: 'power2.inOut' });
      gsap.to(settings, { rainCount: weather.type === 'rain' ? 10 : weather.type === 'thunder' ? 60 : 0, duration: weather.type === 'rain' || weather.type === 'thunder' ? 3 : 1, ease: 'power2.inOut' });
      gsap.to(settings, { leafCount: weather.type === 'wind' ? 5 : 0, duration: weather.type === 'wind' ? 3 : 1, ease: 'power2.inOut' });
      gsap.to(settings, { snowCount: weather.type === 'snow' ? 40 : 0, duration: weather.type === 'snow' ? 3 : 1, ease: 'power2.inOut' });

      if (weather.type === 'sun') {
        gsap.to(sun, { x: sizes.card.width / 2, y: sizes.card.height / 2, duration: 4, ease: 'power2.inOut' });
        gsap.to(sunburst, { scale: 1, opacity: 0.8, y: sizes.card.height / 2 + sizes.card.offset.top, duration: 4, ease: 'power2.inOut' });
      } else {
        gsap.to(sun, { x: sizes.card.width / 2, y: -100, duration: 2, ease: 'power2.inOut' });
        gsap.to(sunburst, { scale: 0.4, opacity: 0, y: sizes.container.height / 2 - 50, duration: 2, ease: 'power2.inOut' });
      }

      startLightningTimer();
    }

    onResize();
    window.addEventListener('resize', onResize);
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    gsap.set(sunburst, { opacity: 0 });
    gsap.fromTo(sunburst, { rotation: 0 }, { rotation: 360, duration: 20, repeat: -1, ease: 'none' });
    changeWeather(WEATHER[0]);
    rafId = requestAnimationFrame(tick);

    // expose a click handler bridge
    containerRef.current._changeWeather = changeWeather;
    // carga el clima real de la ciudad por defecto
    loadAutomaticWeather();

    return () => {
      destroyed = true;
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      clearTimeout(lightningTimeout);
      gsap.killTweensOf('*');
    };
  }, []);

  return (
    <div className="weather-section">
      <div className="weather-demo" ref={containerRef}>
        <svg ref={backSvgRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <radialGradient id="wc-sunburst-grad" cx="0" cy="0" r="320.8304" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: '#FFDE17', stopOpacity: 0.7 }} />
            <stop offset="1" style={{ stopColor: '#FFF200', stopOpacity: 0 }} />
          </radialGradient>
          <path
            ref={sunburstRef}
            style={{ fill: 'url(#wc-sunburst-grad)' }}
            d="M0,319.7c-18.6,0-37.3-1.6-55.5-4.8L-7.8,41.4c5.1,0.9,10.6,0.9,15.7,0L56,314.8C37.6,318,18.8,319.7,0,319.7z M-160.8,276.6c-32.5-18.8-61.3-42.9-85.5-71.6L-34,26.2c3.4,4.1,7.4,7.4,12,10.1L-160.8,276.6z M161.3,276.4L22.1,36.2c4.5-2.6,8.6-6,12-10.1l212.6,178.5C222.5,233.4,193.8,257.6,161.3,276.4z M-302.5,108.3C-315.4,73-321.9,36-322-1.8l277.6-0.5c0,5.3,0.9,10.4,2.7,15.2L-302.5,108.3z M302.6,107.8L41.8,12.8c1.7-4.7,2.6-9.7,2.6-14.9c0-0.3,0-0.6,0-1H322l0-1.3l0,1.9C322,35.4,315.5,72.5,302.6,107.8z M-41.8-17.5l-261-94.5c12.8-35.4,31.6-68,55.8-96.9L-34.1-30.8C-37.5-26.8-40.1-22.3-41.8-17.5z M41.7-17.7c-1.8-4.8-4.4-9.3-7.8-13.3l212-179.2c24.3,28.8,43.3,61.3,56.3,96.6L41.7-17.7z M-22.2-40.8l-139.6-240c32.7-19,68.1-32,105.2-38.6L-8-46.1C-13-45.2-17.8-43.4-22.2-40.8z M22-40.9c-4.4-2.6-9.2-4.3-14.2-5.1l47.1-273.6c37.2,6.4,72.7,19.2,105.4,38L22-40.9z"
          />
        </svg>

        <div className="weather-card" ref={cardRef}>
          <svg ref={innerSvgRef} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <path
                ref={leafTemplateRef}
                id="wc-leaf"
                d="M41.9,56.3l0.1-2.5c0,0,4.6-1.2,5.6-2.2c1-1,3.6-13,12-15.6c9.7-3.1,19.9-2,26.1-2.1c2.7,0-10,23.9-20.5,25 c-7.5,0.8-17.2-5.1-17.2-5.1L41.9,56.3z"
              />
            </defs>
            <circle ref={sunRef} style={{ fill: '#F7ED47' }} cx="0" cy="0" r="50" />
            <g id="wc-layer3" />
            <g ref={cloud3Ref} className="wc-cloud wc-cloud-3" />
            <g id="wc-layer2" />
            <g ref={cloud2Ref} className="wc-cloud wc-cloud-2" />
            <g id="wc-layer1" />
            <g ref={cloud1Ref} className="wc-cloud wc-cloud-1" />
          </svg>

          <div className="weather-details">
            <div className="weather-temperature">
              {temperature}
              <span>°C</span>
            </div>
            <div className="weather-copy">
              <time>{dateLabel}</time>
              <span className="weather-city">{cityLabel}</span>
              <strong ref={summaryRef} />
            </div>
          </div>

          <div className="weather-bio">
            <p className="weather-bio-eyebrow">HEY!</p>
            <p className="weather-bio-intro">{profile.intro}</p>
          </div>
        </div>

        <svg ref={outerSvgRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'visible' }} />

      </div>
    </div>
  );
}