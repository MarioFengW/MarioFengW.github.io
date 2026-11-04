import React, { useEffect, useState } from 'react';
import NebulaBar from './NebulaBar';

const WIDTH = 16;
const STEPS = 64; // re-render only when the bar visibly changes

export function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

/** Page scroll progress drawn as nebula gas filling the bar. Decorative only. */
export default function ScrollMeter() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      setProgress(Math.round(scrollProgress() * STEPS) / STEPS);
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

  return <NebulaBar className="scroll-meter" progress={progress} width={WIDTH} />;
}
