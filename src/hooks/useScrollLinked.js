import { useEffect, useRef } from 'react';

/**
 * Calls `update(element)` on scroll/resize, at most once per animation frame,
 * and only while the element is on screen. `update` should write styles
 * directly (transform/opacity) rather than set React state, so scrolling never
 * re-renders the component.
 */
export default function useScrollLinked(ref, update, { enabled = true } = {}) {
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;

    let rafId = 0;
    let listening = false;
    const run = () => {
      rafId = 0;
      updateRef.current(node);
    };
    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(run);
    };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener('scroll', schedule);
      }
    };

    run(); // correct first paint, even before any scroll
    window.addEventListener('resize', schedule);

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => listen(entry.isIntersecting));
      observer.observe(node);
    } else {
      listen(true);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      listen(false);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, enabled]);
}
