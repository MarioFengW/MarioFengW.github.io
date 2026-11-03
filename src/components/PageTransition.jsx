import React, { useEffect, useRef } from 'react';
import { gridSize, wipeFrame } from '../lib/ascii';
import { easeOutCubic, motionTokens } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';

const COVER_MS = motionTokens.duration.fast * 1000; // quick: the visitor asked to go somewhere
const REVEAL_MS = motionTokens.duration.normal * 1000; // a touch slower so the new view settles

/** Should this click be turned into an in-page transition? */
export function getHashTarget(event) {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link || link.hasAttribute('data-no-transition')) return null;
  const id = decodeURIComponent(link.getAttribute('href').slice(1));
  if (!id) return null;
  const target = document.getElementById(id);
  return target ? { id, target } : null;
}

/** Jump to a section, record it in history and move focus there for keyboard/AT users. */
export function jumpTo({ id, target }) {
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

/**
 * Section-to-section transition: a diagonal sweep of ASCII glyphs covers the
 * screen, the page jumps while covered, then the glyphs clear in the same order.
 * Never blocks input (pointer-events: none) and a new click interrupts it.
 */
export default function PageTransition() {
  const overlayRef = useRef(null);
  const preRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const overlay = overlayRef.current;
    const pre = preRef.current;
    let rafId = 0;
    let seed = 1;

    function measure() {
      const probe = document.createElement('span');
      probe.textContent = 'M'.repeat(20);
      probe.style.visibility = 'hidden';
      probe.style.position = 'absolute';
      pre.appendChild(probe);
      const charWidth = probe.getBoundingClientRect().width / 20;
      pre.removeChild(probe);
      const lineHeight = parseFloat(window.getComputedStyle(pre).lineHeight);
      return gridSize(window.innerWidth, window.innerHeight, charWidth, lineHeight);
    }

    function finish() {
      cancelAnimationFrame(rafId);
      rafId = 0;
      overlay.classList.remove('is-active');
      overlay.style.removeProperty('--wipe');
      pre.textContent = '';
    }

    function run(destination) {
      const { cols, rows } = measure();
      seed += 1;
      overlay.classList.add('is-active');
      let phase = 'cover';
      let phaseStart = null;

      function frame(now) {
        if (phaseStart === null) phaseStart = now;
        const duration = phase === 'cover' ? COVER_MS : REVEAL_MS;
        const linear = Math.min(1, (now - phaseStart) / duration);
        const progress = easeOutCubic(linear);
        pre.textContent = wipeFrame(cols, rows, progress, phase, seed);
        // Solid backdrop tracks the glyphs so the jump itself is never seen.
        overlay.style.setProperty('--wipe', String(phase === 'cover' ? progress : 1 - progress));

        if (linear < 1) {
          rafId = requestAnimationFrame(frame);
        } else if (phase === 'cover') {
          jumpTo(destination);
          phase = 'reveal';
          phaseStart = null;
          rafId = requestAnimationFrame(frame);
        } else {
          finish();
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    function handleClick(event) {
      const destination = getHashTarget(event);
      if (!destination) return;
      event.preventDefault();
      if (rafId) finish(); // interrupt a running transition
      if (reducedRef.current) {
        jumpTo(destination);
        return;
      }
      run(destination);
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      finish();
    };
  }, []);

  return (
    <div ref={overlayRef} className="page-transition" aria-hidden="true">
      <pre ref={preRef} className="page-transition-pre" />
    </div>
  );
}
