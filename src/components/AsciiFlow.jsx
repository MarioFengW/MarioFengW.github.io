import React, { useEffect, useMemo, useRef } from 'react';
import { findWires, flowFrame, FLOW_RATE } from '../lib/flow';
import useReducedMotion from '../hooks/useReducedMotion';

const FAST = 2; // speed multiplier while `fast` (hovered card)
const MAX_BURSTS = 6;

/**
 * An ASCII diagram whose wires carry packets of nebula light. Runs only while
 * on screen; with reduced motion it stays a still drawing. Decorative.
 *
 * Time is a virtual clock that advances exactly one cell (1 / FLOW_RATE s) per
 * painted frame, so a packet always moves one cell per frame. `fast` paints
 * twice as often, so packets speed up from where they are, without a jump.
 *
 * `bursts`: one-off packets, each `{ id, path }` ([{ x, y }] cells). A burst
 * leaves at the clock time it is first seen.
 */
export default function AsciiFlow({ lines, className = '', fast = false, bursts = [] }) {
  const reducedMotion = useReducedMotion();
  const wires = useMemo(() => findWires(lines), [lines]);
  const wrapRef = useRef(null);
  const baseRef = useRef(null);
  const trailRef = useRef(null);
  const headRef = useRef(null);
  const fastRef = useRef(fast);
  fastRef.current = fast;
  const burstsRef = useRef(bursts);
  burstsRef.current = bursts;
  const still = lines.join('\n');

  useEffect(() => {
    const wrap = wrapRef.current;
    if (reducedMotion || !wrap) return undefined;
    const base = baseRef.current;
    const trail = trailRef.current;
    const head = headRef.current;
    const launched = new Map(); // burst id -> clock time it left
    let rafId = 0;
    let last = 0;
    let clock = 0;
    let visible = false;

    function paint() {
      const live = burstsRef.current.slice(-MAX_BURSTS).map((burst) => {
        if (!launched.has(burst.id)) launched.set(burst.id, clock);
        return { path: burst.path, t0: launched.get(burst.id) };
      });
      const frame = flowFrame(lines, wires, clock, live);
      base.textContent = frame.base;
      trail.textContent = frame.trail;
      head.textContent = frame.head;
    }

    function loop(now) {
      rafId = requestAnimationFrame(loop);
      if (!visible || document.hidden) return; // time offscreen does not count
      const rate = fastRef.current ? FAST : 1;
      if (now - last < 1000 / (FLOW_RATE * rate)) return;
      last = now;
      clock += 1 / FLOW_RATE;
      paint();
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
  }, [lines, wires, reducedMotion, still]);

  return (
    <div className={`ascii-flow ${className}`.trim()} ref={wrapRef} aria-hidden="true">
      <pre className="ascii-flow-base" ref={baseRef}>{still}</pre>
      <pre className="ascii-flow-trail" ref={trailRef} />
      <pre className="ascii-flow-head" ref={headRef} />
    </div>
  );
}
