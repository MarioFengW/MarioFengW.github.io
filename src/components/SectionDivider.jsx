import React, { useEffect, useRef } from 'react';
import { cellNoise, charForIntensity, clamp, sweepCoverage } from '../lib/ascii';
import useReducedMotion from '../hooks/useReducedMotion';
import { measureGrid } from '../hooks/useAsciiLoop';

// Lighter ramp than the page wipe: a band of glyphs, never a solid bar.
const DIVIDER_RAMP = ' .,:;-=+';

/** 0 when the band enters at the bottom of the viewport, 1 when it leaves at the top. */
export function dividerProgress(top, height, viewportHeight) {
  return clamp((viewportHeight - top) / (viewportHeight + height), 0, 1);
}

/**
 * Glyphs sweep in during the first half of the pass and sweep out during the second.
 * Each cell's brightness is scaled by fixed noise, so even full coverage reads as
 * texture rather than a uniform bar.
 */
export function dividerFrame(cols, rows, progress, seed = 3) {
  if (cols <= 0 || rows <= 0) return '';
  const covering = progress < 0.5;
  const local = covering ? progress * 2 : (progress - 0.5) * 2;
  const lines = new Array(rows);
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const swept = sweepCoverage(x, y, cols, rows, local, seed);
      const coverage = covering ? swept : 1 - swept;
      const texture = 0.3 + 0.7 * cellNoise(x, y, seed + 11);
      line += charForIntensity(coverage * texture, DIVIDER_RAMP);
    }
    lines[y] = line;
  }
  return lines.join('\n');
}

/**
 * Scroll-linked ASCII band between two sections, labelled with the next one.
 * The scroll position drives it directly, so it moves exactly as fast as you scroll.
 */
export default function SectionDivider({ label }) {
  const wrapRef = useRef(null);
  const preRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre = preRef.current;
    if (reducedMotion) {
      pre.textContent = '';
      return undefined;
    }

    let grid = { cols: 0, rows: 0 };
    let rafId = 0;
    let listening = false;

    const update = () => {
      rafId = 0;
      const rect = wrap.getBoundingClientRect();
      const progress = dividerProgress(rect.top, rect.height, window.innerHeight);
      pre.textContent = dividerFrame(grid.cols, grid.rows, progress);
    };
    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    const remeasure = () => {
      const rect = wrap.getBoundingClientRect();
      grid = measureGrid(pre, rect.width, rect.height);
      schedule();
    };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener('scroll', schedule);
      }
    };

    remeasure();
    window.addEventListener('resize', remeasure);

    // Only follow scroll while the band is on screen.
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => listen(entry.isIntersecting));
      observer.observe(wrap);
    } else {
      listen(true);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      listen(false);
      window.removeEventListener('resize', remeasure);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="section-divider" aria-hidden="true">
      <pre ref={preRef} className="section-divider-pre" />
      <span className="section-divider-label">{label}</span>
    </div>
  );
}
