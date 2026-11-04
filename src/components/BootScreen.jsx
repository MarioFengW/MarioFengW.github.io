import React, { useEffect, useRef, useState } from 'react';
import { asciiProgress, clamp, wipeFrame } from '../lib/ascii';
import { easeOutCubic, motionTokens } from '../lib/motion-tokens';
import useReducedMotion from '../hooks/useReducedMotion';
import { measureGrid } from '../hooks/useAsciiLoop';

export const BOOT_LINES = [
  'mario-feng-wu ~ % ./portfolio --boot',
  '[ ok ] mounting /dev/nebula',
  '[ ok ] loading modules: ml · full-stack · cloud',
  '[ ok ] syncing sky over taipei',
];
// Short on purpose: the visitor came for the portfolio, not the loader.
const LINE_MS = 80;
const BAR_MS = 280;
const HOLD_MS = 60;
const BAR_START_MS = (BOOT_LINES.length - 1) * LINE_MS;
// Seen once per browser session; later loads go straight to the page.
export const BOOT_SEEN_KEY = 'boot-seen';

function readSeen() {
  try { return window.sessionStorage.getItem(BOOT_SEEN_KEY) === '1'; } catch { return false; }
}

function markSeen() {
  try { window.sessionStorage.setItem(BOOT_SEEN_KEY, '1'); } catch { /* storage blocked: boot plays again */ }
}

export const BOOT_LOG_MS = BAR_START_MS + BAR_MS + HOLD_MS;
const REVEAL_MS = motionTokens.duration.normal * 1000;

/** The boot log as it should read `elapsed` ms after start. */
export function bootLog(elapsed) {
  const shown = clamp(1 + Math.floor(elapsed / LINE_MS), 1, BOOT_LINES.length);
  const lines = BOOT_LINES.slice(0, shown);
  if (elapsed >= BAR_START_MS) lines.push(asciiProgress((elapsed - BAR_START_MS) / BAR_MS, 24));
  return lines.join('\n');
}

/**
 * Full-screen terminal boot on the first load of a session: the log types out, then dissolves in
 * an ASCII wipe to reveal the page. Click or press any key to skip.
 * Server-rendered so it covers the page from the first paint.
 */
export default function BootScreen({ onDone }) {
  const [done, setDone] = useState(false);
  const reducedMotion = useReducedMotion();
  const overlayRef = useRef(null);
  const logRef = useRef(null);
  const wipeRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let rafId = 0;
    let finished = false;
    let announced = false;
    // `onDone` fires as soon as the dissolve starts (the page is already
    // visible underneath), not after the overlay is gone.
    const announce = () => {
      if (announced) return;
      announced = true;
      onDoneRef.current?.();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      announce();
      setDone(true);
    };

    if (reducedMotion || readSeen()) {
      finish();
      return undefined;
    }

    const overlay = overlayRef.current;
    const { cols, rows } = measureGrid(wipeRef.current, window.innerWidth, window.innerHeight);
    let start = null;
    let skipped = false;

    function frame(now) {
      if (start === null) start = now;
      const elapsed = skipped ? Math.max(now - start, BOOT_LOG_MS) : now - start;
      if (elapsed < BOOT_LOG_MS) {
        logRef.current.textContent = bootLog(elapsed);
      } else {
        announce();
        const linear = Math.min(1, (elapsed - BOOT_LOG_MS) / REVEAL_MS);
        const progress = easeOutCubic(linear);
        wipeRef.current.textContent = wipeFrame(cols, rows, progress, 'reveal', 7);
        overlay.style.setProperty('--wipe', String(1 - progress));
        if (linear >= 1) {
          finish();
          return;
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    const skip = () => {
      if (skipped || start === null) return;
      skipped = true;
      start = performance.now() - BOOT_LOG_MS; // jump straight to the reveal
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    markSeen();
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [reducedMotion]);

  if (done) return null;
  return (
    <div ref={overlayRef} className="boot" aria-hidden="true">
      <pre ref={wipeRef} className="boot-wipe" />
      <pre ref={logRef} className="boot-log">{bootLog(0)}</pre>
      <p className="boot-hint">click or press any key to skip</p>
    </div>
  );
}
