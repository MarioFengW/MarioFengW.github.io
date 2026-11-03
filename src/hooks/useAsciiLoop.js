import { useEffect, useRef } from 'react';
import { gridSize } from '../lib/ascii';

/** How many monospace cells (in `probeHost`'s font) cover a width x height box. */
export function measureGrid(probeHost, width, height) {
  const probe = document.createElement('span');
  probe.textContent = 'M'.repeat(20);
  probe.style.visibility = 'hidden';
  probe.style.position = 'absolute';
  probeHost.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 20;
  probeHost.removeChild(probe);
  const lineHeight = parseFloat(window.getComputedStyle(probeHost).lineHeight);
  return { ...gridSize(width, height, charWidth, lineHeight), charWidth, lineHeight };
}

/**
 * Shared engine for full-box ASCII animations.
 *
 * - Measures how many monospace cells cover `wrapRef` (using the font of `probeRef`).
 * - Calls `draw(cols, rows, t, pointer)` at most `fps` times a second while playing.
 * - Pauses when offscreen or in a background tab; when `playing` is false it draws
 *   one frame and keeps it (resuming continues from the same moment).
 * - Re-measures on box resize and once web fonts finish loading.
 * - With `trackPointer`, passes the eased pointer position in cells (or null).
 */
export default function useAsciiLoop(wrapRef, probeRef, draw, { playing = true, fps = 24, trackPointer = false } = {}) {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const elapsedRef = useRef(0); // seconds shown so far; survives pause/resume

  useEffect(() => {
    const wrap = wrapRef.current;
    const probeHost = probeRef.current;
    if (!wrap || !probeHost) return undefined;

    const frameMs = 1000 / fps;
    let cols = 0;
    let rows = 0;
    let rafId = 0;
    let lastFrame = 0;
    let isVisible = true;
    let target = null;
    let pointer = null;
    let metrics = { charWidth: 0, lineHeight: 0 };
    const runStart = performance.now();
    const baseElapsed = elapsedRef.current;

    function measure() {
      const rect = wrap.getBoundingClientRect();
      const grid = measureGrid(probeHost, rect.width, rect.height);
      ({ cols, rows } = grid);
      metrics = { charWidth: grid.charWidth, lineHeight: grid.lineHeight };
    }

    function render(now) {
      const t = playing ? baseElapsed + (now - runStart) / 1000 : baseElapsed;
      elapsedRef.current = t;
      if (target) {
        pointer = pointer
          ? { x: pointer.x + (target.x - pointer.x) * 0.12, y: pointer.y + (target.y - pointer.y) * 0.12 }
          : { ...target };
      }
      drawRef.current(cols, rows, t, pointer);
    }

    function refresh() {
      measure();
      render(performance.now());
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      if (!isVisible || document.hidden) return;
      if (now - lastFrame < frameMs) return;
      lastFrame = now;
      render(now);
    }

    function handlePointerMove(event) {
      const rect = wrap.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside || !metrics.charWidth) {
        target = null;
        pointer = null;
        return;
      }
      target = {
        x: (event.clientX - rect.left) / metrics.charWidth,
        y: (event.clientY - rect.top) / metrics.lineHeight,
      };
    }

    refresh();

    let resizeObserver;
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(refresh);
      resizeObserver.observe(wrap);
    } else {
      window.addEventListener('resize', refresh);
    }
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) refresh();
    });

    let observer;
    if (playing) {
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
        });
        observer.observe(wrap);
      }
      rafId = requestAnimationFrame(loop);
      if (trackPointer) window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [wrapRef, probeRef, playing, fps, trackPointer]);
}
