import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getFocus, isPaused, registeredSections, setActiveSection, subscribe } from '../lib/nebulaFocus';
import { blendShapes } from '../lib/stages';
import { frameRates } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';
import AsciiField from './AsciiField';
import ScrambleText from './ScrambleText';

export const MORPH_S = 0.9; // seconds for the gas to re-form into the next shape

/** The registered section whose box contains the middle of the viewport. */
export function sectionAtMiddle(ids, mid) {
  for (const id of ids) {
    const node = document.getElementById(id);
    if (!node) continue;
    const rect = node.getBoundingClientRect();
    if (rect.top <= mid && rect.bottom > mid) return id;
  }
  return null;
}

/**
 * The page's single background: one fixed ASCII nebula behind every section.
 * Sections tell it what shape to take (see useNebulaFocus); when the focus
 * changes - scrolling into another section, a new step, a hovered entry, the
 * card on top of the project stack - the same gas re-forms into the new shape.
 * There are no per-section backgrounds, so there are no seams between them.
 */
export default function PageNebula() {
  const reducedMotion = useReducedMotion();
  const [focus, setFocus] = useState(getFocus);
  const [paused, setPausedState] = useState(isPaused);
  const [morphing, setMorphing] = useState(false);
  const morphRef = useRef({ from: null, to: getFocus().shape, start: null });
  const keyRef = useRef(getFocus().key);

  useEffect(
    () =>
      subscribe(() => {
        const next = getFocus();
        setPausedState(isPaused());
        if (next.key === keyRef.current) return;
        keyRef.current = next.key;
        morphRef.current = { from: morphRef.current.to, to: next.shape, start: null };
        setFocus(next);
        setMorphing(true);
      }),
    []
  );

  useEffect(() => {
    if (!morphing) return undefined;
    const id = setTimeout(() => setMorphing(false), MORPH_S * 1000 + 50);
    return () => clearTimeout(id);
  }, [morphing, focus.key]);

  // Which section owns the screen: the one under the middle of the viewport.
  useEffect(() => {
    let rafId = 0;
    const check = () => {
      rafId = 0;
      setActiveSection(sectionAtMiddle(registeredSections(), window.innerHeight / 2));
    };
    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  const playing = !reducedMotion && !paused;

  const shapeFor = useCallback(
    (cols, rows, t) => {
      const morph = morphRef.current;
      if (morph.start === null) morph.start = t;
      const k = playing ? Math.min(1, (t - morph.start) / MORPH_S) : 1;
      return blendShapes(morph.from, morph.to, cols, rows, t, k);
    },
    [playing]
  );

  return (
    <div className="page-nebula" aria-hidden="true">
      <AsciiField
        className="page-nebula-field"
        playing={playing}
        fps={morphing || focus.key === 'hero' ? frameRates.morph : frameRates.field}
        shapeFor={shapeFor}
        redrawKey={playing ? null : focus.key}
      />
      {focus.label && (
        <p className="nebula-hud">
          <ScrambleText key={focus.key} text={focus.label} immediate />
        </p>
      )}
    </div>
  );
}
