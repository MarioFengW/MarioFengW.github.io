import React, { useEffect, useRef } from 'react';
import { gridSize, renderTopoFrame } from '../lib/ascii';

const FRAME_MS = 1000 / 24; // ASCII reads best at a slightly "stepped" frame rate.

/**
 * Animated ASCII topographic map. The pointer raises a hill in the field,
 * so the contour lines bend around the cursor. Purely decorative.
 *
 * `playing` is controlled by the parent (pause button / reduced motion).
 * When paused it keeps showing the last frame instead of jumping.
 */
export default function AsciiField({ className = '', playing = true }) {
  const wrapRef = useRef(null);
  const preRef = useRef(null);
  const elapsedRef = useRef(0); // seconds of animation shown so far; survives pause/resume

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre = preRef.current;
    if (!wrap || !pre) return undefined;

    let cols = 0;
    let rows = 0;
    let rafId = 0;
    let lastFrame = 0;
    let isVisible = true;
    let target = null; // pointer position in cells
    let pointer = null; // eased pointer position
    let metrics = { charWidth: 0, lineHeight: 0 };
    const runStart = performance.now();
    const baseElapsed = elapsedRef.current;

    function measure() {
      const probe = document.createElement('span');
      probe.textContent = 'M'.repeat(20);
      probe.style.visibility = 'hidden';
      probe.style.position = 'absolute';
      pre.appendChild(probe);
      const charWidth = probe.getBoundingClientRect().width / 20;
      pre.removeChild(probe);
      const lineHeight = parseFloat(window.getComputedStyle(pre).lineHeight);
      const rect = wrap.getBoundingClientRect();
      ({ cols, rows } = gridSize(rect.width, rect.height, charWidth, lineHeight));
      metrics = { charWidth, lineHeight };
    }

    function currentTime(now) {
      return playing ? baseElapsed + (now - runStart) / 1000 : baseElapsed;
    }

    function draw(now) {
      const t = currentTime(now);
      elapsedRef.current = t;
      if (target) {
        pointer = pointer
          ? { x: pointer.x + (target.x - pointer.x) * 0.12, y: pointer.y + (target.y - pointer.y) * 0.12 }
          : { ...target };
      }
      pre.textContent = renderTopoFrame(cols, rows, t, pointer);
    }

    function refresh() {
      measure();
      draw(performance.now());
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      if (!isVisible || document.hidden) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      draw(now);
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

    // Re-measure when the box changes size (not just the window) and once the
    // web font has loaded, since the character width changes on font swap.
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
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [playing]);

  return (
    <div ref={wrapRef} className={`ascii-field ${className}`.trim()} aria-hidden="true">
      <pre ref={preRef} className="ascii-field-pre" />
    </div>
  );
}
