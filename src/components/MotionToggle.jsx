import React, { useEffect, useState } from 'react';
import { setPaused } from '../lib/nebulaFocus';
import useReducedMotion from '../hooks/useReducedMotion';

/**
 * Pause / play for the page nebula. It lives in the header because the nebula
 * is the background of the whole page, not of one section. Starts paused when
 * the OS asks for reduced motion; the visitor can still press play.
 */
export default function MotionToggle() {
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setPlaying(!reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    setPaused(!playing);
  }, [playing]);

  return (
    <button
      type="button"
      className="motion-toggle"
      onClick={() => setPlaying((value) => !value)}
      aria-label={playing ? 'Pause background animation' : 'Play background animation'}
    >
      <span aria-hidden="true">{playing ? '[||]' : '[>]'}</span>
      <span className="motion-toggle-label" aria-hidden="true">{playing ? 'ascii' : 'ascii off'}</span>
    </button>
  );
}
