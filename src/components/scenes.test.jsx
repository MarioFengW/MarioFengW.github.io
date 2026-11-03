import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import BootScreen, { BOOT_LINES, BOOT_LOG_MS, bootLog } from './BootScreen';
import SectionDivider, { dividerFrame, dividerProgress } from './SectionDivider';
import WeatherBackdrop from './WeatherBackdrop';
import About from './About';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Hero from './Hero';
import SectionHeading from './SectionHeading';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';

// Every box measures 160x60 px with 8px-wide glyphs on 15px lines -> 20 cols x 4 rows.
function mockLayout() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0, top: 0, right: 160, bottom: 60, width: 160, height: 60, x: 0, y: 0,
  });
  const real = window.getComputedStyle.bind(window);
  // Proxy (not a spread copy) so getters like `opacity` and methods keep working.
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
    const style = real(el);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === 'lineHeight') return '15px';
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bootLog', () => {
  it('types lines out one by one, then fills a progress bar', () => {
    expect(bootLog(0)).toBe(BOOT_LINES[0]);
    expect(bootLog(115).split('\n')).toHaveLength(2);
    const full = bootLog(BOOT_LOG_MS).split('\n');
    expect(full.slice(0, BOOT_LINES.length)).toEqual(BOOT_LINES);
    expect(full[full.length - 1]).toMatch(/^\[#+\] 100%$/);
  });
});

describe('BootScreen', () => {
  beforeEach(mockLayout);

  it('server-renders the first log line so it covers the page from the first paint', () => {
    mockReducedMotion(false);
    mockAnimationFrame();
    const { container } = render(<BootScreen onDone={() => {}} />);
    expect(container.querySelector('.boot')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.boot-log').textContent).toBe(BOOT_LINES[0]);
  });

  it('plays the log, dissolves, then unmounts and reports done', () => {
    mockReducedMotion(false);
    const raf = mockAnimationFrame();
    const onDone = vi.fn();
    const { container } = render(<BootScreen onDone={onDone} />);
    const log = () => container.querySelector('.boot-log')?.textContent;

    raf.step(1000);
    raf.step(1000 + 250);
    expect(log().split('\n').length).toBeGreaterThan(2);
    expect(onDone).not.toHaveBeenCalled(); // still typing
    raf.step(1000 + BOOT_LOG_MS + 150); // mid-dissolve
    const wipe = Number(container.querySelector('.boot').style.getPropertyValue('--wipe'));
    expect(wipe).toBeGreaterThan(0);
    expect(wipe).toBeLessThan(1);
    // "Booted" is announced as the dissolve starts, so the hero intro overlaps it.
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.boot')).not.toBeNull();

    act(() => raf.step(1000 + BOOT_LOG_MS + 400));
    expect(onDone).toHaveBeenCalledTimes(1); // only once
    expect(container.querySelector('.boot')).toBeNull();
  });

  it('any key or click skips straight to the dissolve', () => {
    mockReducedMotion(false);
    const raf = mockAnimationFrame();
    const onDone = vi.fn();
    render(<BootScreen onDone={onDone} />);
    fireEvent.keyDown(window, { key: 'x' }); // before the first frame: ignored
    raf.step(0);
    vi.spyOn(performance, 'now').mockReturnValue(50);
    fireEvent.pointerDown(window);
    fireEvent.keyDown(window, { key: 'Enter' }); // second skip is a no-op
    act(() => raf.step(60));
    act(() => raf.step(60 + 400));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('is skipped entirely with reduced motion', () => {
    mockReducedMotion(true);
    const onDone = vi.fn();
    const { container } = render(<BootScreen onDone={onDone} />);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.boot')).toBeNull();
  });

  it('the page underneath is already rendered and visible while booting', () => {
    mockReducedMotion(false);
    mockAnimationFrame();
    const { container } = render(
      <>
        <Hero />
        <BootScreen />
      </>
    );
    expect(container.querySelector('.boot')).not.toBeNull();
    expect(container.querySelector('.hero-summary')).toBeVisible(); // the dissolve reveals it
  });
});

describe('SectionDivider', () => {
  it('progress runs 0 -> 1 as the band crosses the viewport', () => {
    expect(dividerProgress(1000, 100, 900)).toBe(0); // below the fold
    expect(dividerProgress(400, 100, 900)).toBe(0.5);
    expect(dividerProgress(-100, 100, 900)).toBe(1); // scrolled past
  });

  it('glyphs sweep in during the first half and out during the second, never solid', () => {
    const filled = (s) => s.replace(/\s/g, '').length;
    expect(filled(dividerFrame(40, 4, 0))).toBe(0);
    expect(filled(dividerFrame(40, 4, 0.5))).toBe(160); // fully covered at the midpoint
    expect(dividerFrame(40, 4, 0.5)).not.toMatch(/[@#%]/); // light ramp only
    expect(new Set(dividerFrame(40, 4, 0.5).replace(/\s/g, '')).size).toBeGreaterThan(2); // textured, not a bar
    expect(filled(dividerFrame(40, 4, 1))).toBe(0);
    expect(filled(dividerFrame(40, 4, 0.25))).toBeLessThan(160);
    expect(dividerFrame(0, 4, 0.5)).toBe('');
  });

  it('follows scroll only while on screen and cleans up', () => {
    mockLayout();
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    vi.stubGlobal('innerHeight', 900);
    const { container, unmount } = render(<SectionDivider label=">> 02 expertise" />);
    const pre = container.querySelector('.section-divider-pre');
    expect(container.querySelector('.section-divider')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('>> 02 expertise')).toBeInTheDocument();
    raf.step(0); // initial measure

    io.trigger(true);
    window.dispatchEvent(new Event('scroll'));
    raf.step(16);
    expect(pre.textContent.split('\n')).toHaveLength(4);

    io.trigger(false);
    pre.textContent = 'stale';
    window.dispatchEvent(new Event('scroll'));
    raf.step(32);
    expect(pre.textContent).toBe('stale'); // not listening offscreen

    window.dispatchEvent(new Event('resize'));
    unmount();
    expect(raf.pending()).toBe(0);
  });

  it('works without IntersectionObserver and stays empty with reduced motion', () => {
    mockLayout();
    mockReducedMotion(false);
    const original = window.IntersectionObserver;
    delete window.IntersectionObserver;
    try {
      const raf = mockAnimationFrame();
      const { container } = render(<SectionDivider label="x" />);
      raf.step(0);
      expect(container.querySelector('pre').textContent.length).toBeGreaterThan(0);
    } finally {
      window.IntersectionObserver = original;
    }
    mockReducedMotion(true);
    const { container } = render(<SectionDivider label="y" />);
    expect(container.querySelector('pre').textContent).toBe('');
  });
});

describe('WeatherBackdrop', () => {
  beforeEach(mockLayout);

  it('draws the scene for its type and flashes during storms', () => {
    mockReducedMotion(false);
    mockIntersectionObserver();
    const raf = mockAnimationFrame();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const { container } = render(<WeatherBackdrop type="thunder" />);
    const wrap = container.querySelector('.weather-backdrop');
    expect(wrap).toHaveAttribute('data-type', 'thunder');
    expect(wrap).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('pre').textContent.split('\n')).toHaveLength(4);
    expect(wrap).toHaveClass('is-flash'); // t = 0 is a flash

    raf.step(3000); // mid-cycle
    expect(wrap).not.toHaveClass('is-flash');
  });

  it('holds a static frame when not playing', () => {
    const raf = mockAnimationFrame();
    const { container } = render(<WeatherBackdrop type="snow" playing={false} />);
    expect(container.querySelector('pre').textContent.length).toBeGreaterThan(0);
    expect(raf.pending()).toBe(0);
  });
});

describe('About with live weather', () => {
  beforeEach(mockLayout);

  it('shows the reading and switches the backdrop to the live condition', async () => {
    mockReducedMotion(false);
    mockAnimationFrame();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 26.4, weather_code: 63, wind_speed_10m: 4, is_day: 1 } }),
    });
    const { container } = render(<About fetchImpl={fetchImpl} />);
    expect(container.querySelector('.weather-backdrop')).toHaveAttribute('data-type', 'cloud'); // while loading
    expect(await screen.findByText('Rain')).toBeInTheDocument();
    expect(container.querySelector('.weather-status-temp')).toHaveTextContent('26°C');
    expect(container.querySelector('.weather-backdrop')).toHaveAttribute('data-type', 'rain');
    expect(screen.getByRole('complementary', { name: 'Weather in Taipei' })).toBeInTheDocument();
  });

  it('falls back to clouds and an offline note when the request fails', async () => {
    mockReducedMotion(true);
    const raf = mockAnimationFrame();
    const { container } = render(<About fetchImpl={vi.fn().mockRejectedValue(new Error('offline'))} />);
    expect(await screen.findByText('weather offline')).toBeInTheDocument();
    expect(container.querySelector('.weather-backdrop')).toHaveAttribute('data-type', 'cloud');
    expect(container.querySelector('.weather-status-temp')).toHaveTextContent('--°C');
    expect(raf.pending()).toBe(0); // reduced motion: static backdrop
  });

  it('uses window.fetch by default and ignores results after unmount', async () => {
    mockReducedMotion(false);
    mockAnimationFrame();
    const consoleError = vi.spyOn(console, 'error');
    let resolve;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((r) => { resolve = r; })));
    const { unmount } = render(<About />);
    expect(window.fetch).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {
      resolve({ ok: true, json: async () => ({ current: { temperature_2m: 1, weather_code: 0, is_day: 1 } }) });
    });
    let reject;
    vi.stubGlobal('fetch', vi.fn(() => new Promise((_r, j) => { reject = j; })));
    render(<About />).unmount();
    await act(async () => reject(new Error('late')));
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('scroll-driven CSS', () => {
  it('uses only animation longhands next to animation-timeline (minifier-safe)', () => {
    const css = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf8');
    const block = css.slice(css.indexOf('@supports (animation-timeline: view())'));
    const body = block.slice(0, block.indexOf('@keyframes'));
    expect(body).toContain('animation-timeline: view()');
    // A shorthand reordered after animation-timeline would silently reset it to auto.
    expect(body).not.toMatch(/\banimation\s*:/);
  });
});

describe('SectionHeading', () => {
  it('is just the heading and a rule: no eyebrow, nothing hidden by default', () => {
    mockReducedMotion(false);
    const { container } = render(<SectionHeading title="What I work on" />);
    expect(screen.getByRole('heading', { level: 2, name: 'What I work on' })).toBeVisible();
    expect(container.querySelector('.kicker')).toBeNull();
    expect(container.querySelector('.ascii-rule')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('[style*="clip-path"]')).toBeNull();
  });
});
