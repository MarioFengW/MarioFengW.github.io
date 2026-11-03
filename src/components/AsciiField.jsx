import React, { useEffect, useRef } from 'react';
import { gridSize, renderTopoFrame } from '../lib/ascii';
import useReducedMotion from '../hooks/useReducedMotion';

const FRAME_MS = 1000 / 24; // ASCII reads best at a slightly "stepped" frame rate.

/**
 * Animated ASCII topographic map. The pointer raises a hill in the field,
 * so the contour lines bend around the cursor. Purely decorative.
 */
export default function AsciiField({ className = '' }) {
  const wrapRef = useRef(null);
  const preRef = useRef(null);
  const reducedMotion = useReducedMotion();

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
    const start = performance.now();

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
      return { charWidth, lineHeight };
    }

    let metrics = measure();

    function draw(now) {
      const t = (now - start) / 1000;
      if (target) {
        pointer = pointer
          ? { x: pointer.x + (target.x - pointer.x) * 0.12, y: pointer.y + (target.y - pointer.y) * 0.12 }
          : { ...target };
      }
      pre.textContent = renderTopoFrame(cols, rows, t, pointer);
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      if (!isVisible || document.hidden) return;
      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;
      draw(now);
    }

    function handleResize() {
      metrics = measure();
      draw(performance.now());
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

    // Reduced motion: one static frame, no loop, no pointer tracking.
    if (reducedMotion) {
      draw(start + 12000);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      });
      observer.observe(wrap);
    }

    draw(start);
    rafId = requestAnimationFrame(loop);
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className={`ascii-field ${className}`.trim()} aria-hidden="true">
      <pre ref={preRef} className="ascii-field-pre" />
    </div>
  );
}
