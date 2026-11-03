import React, { useEffect, useRef } from 'react';
import { scrambleText } from '../lib/ascii';
import useReducedMotion from '../hooks/useReducedMotion';

const DURATION_MS = 700;
const STEP_MS = 40;

/**
 * Text that "decodes" from random glyphs the first time it scrolls into view.
 * Screen readers always get the real text; the animated copy is aria-hidden.
 * Server-rendered output is the final text, so no-JS visitors see it normally.
 */
export default function ScrambleText({ text, as: Tag = 'span', className }) {
  const visualRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = visualRef.current;
    if (!node || reducedMotion || !('IntersectionObserver' in window)) return undefined;

    let rafId = 0;
    let started = false;

    function run() {
      const start = performance.now();
      let lastStep = 0;
      function frame(now) {
        const progress = (now - start) / DURATION_MS;
        if (progress >= 1) {
          node.textContent = text;
          return;
        }
        if (now - lastStep >= STEP_MS) {
          lastStep = now;
          node.textContent = scrambleText(text, progress);
        }
        rafId = requestAnimationFrame(frame);
      }
      rafId = requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      node.textContent = text;
    };
  }, [text, reducedMotion]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span ref={visualRef} aria-hidden="true">{text}</span>
    </Tag>
  );
}
