import React, { useEffect, useMemo, useRef } from 'react';
import { findWires, flowFrame } from '../lib/flow';
import useReducedMotion from '../hooks/useReducedMotion';

const FPS = 12;

/**
 * A project's architecture as an ASCII diagram whose wires carry packets of
 * nebula light. Runs only while on screen; with reduced motion it stays a
 * still drawing. Decorative: the card's text describes the project.
 */
export default function AsciiFlow({ lines, className = '' }) {
  const reducedMotion = useReducedMotion();
  const wires = useMemo(() => findWires(lines), [lines]);
  const wrapRef = useRef(null);
  const refs = { base: useRef(null), trail: useRef(null), head: useRef(null) };
  const still = lines.join('\n');

  useEffect(() => {
    const wrap = wrapRef.current;
    if (reducedMotion || !wrap) return undefined;
    const base = refs.base.current;
    const trail = refs.trail.current;
    const head = refs.head.current;
    let rafId = 0;
    let last = 0;
    let visible = false;
    const start = performance.now();

    function paint(now) {
      const frame = flowFrame(lines, wires, (now - start) / 1000);
      base.textContent = frame.base;
      trail.textContent = frame.trail;
      head.textContent = frame.head;
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 1000 / FPS) return;
      last = now;
      paint(now);
    }

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
          })
        : null;
    if (observer) observer.observe(wrap);
    else visible = true;
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      base.textContent = still;
      trail.textContent = '';
      head.textContent = '';
    };
    // refs are stable objects created per render; lines/wires drive the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, wires, reducedMotion, still]);

  return (
    <div className={`ascii-flow ${className}`.trim()} ref={wrapRef} aria-hidden="true">
      <pre className="ascii-flow-base" ref={refs.base}>{still}</pre>
      <pre className="ascii-flow-trail" ref={refs.trail} />
      <pre className="ascii-flow-head" ref={refs.head} />
    </div>
  );
}
