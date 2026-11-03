import React, { useEffect, useRef } from 'react';
import { asciiProgress } from '../lib/ascii';

const WIDTH = 16;

export function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

/** Page scroll progress drawn as `[######..........]  37%`. Decorative only. */
export default function ScrollMeter() {
  const ref = useRef(null);

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      if (ref.current) ref.current.textContent = asciiProgress(scrollProgress(), WIDTH);
    };
    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <span ref={ref} className="scroll-meter" aria-hidden="true">
      {asciiProgress(0, WIDTH)}
    </span>
  );
}
