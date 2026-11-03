import React, { useEffect, useRef } from 'react';
import { easeOutCubic, motionTokens } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';

export function formatCount(value, decimals = 0) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts up from 0 the first time it scrolls into view. The server-rendered
 * text is the final value, so no-JS and reduced-motion visitors see real numbers.
 * Hand-rolled rAF tween: avoids pulling motion's full animation engine into the bundle.
 */
export default function Counter({ value, decimals = 0 }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion || !('IntersectionObserver' in window)) return undefined;

    const final = formatCount(value, decimals);
    const durationMs = motionTokens.duration.crawl * 1000;
    let rafId = 0;

    function run() {
      let start = null;
      node.textContent = formatCount(0, decimals);
      function frame(now) {
        if (start === null) start = now;
        const progress = Math.min(1, (now - start) / durationMs);
        node.textContent = formatCount(value * easeOutCubic(progress), decimals);
        if (progress < 1) rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { rootMargin: motionTokens.viewportMargin }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      node.textContent = final;
    };
  }, [reducedMotion, value, decimals]);

  return <span ref={ref}>{formatCount(value, decimals)}</span>;
}
