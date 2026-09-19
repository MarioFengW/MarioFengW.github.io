import React, { useEffect, useRef } from 'react';

const interactiveSelector = 'a, button, input, select, textarea, [role="button"], [data-cursor-expand], [onclick]';

export default function CursorFollower() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    function handlePointerMove(event) {
      const target = event.target instanceof Element ? event.target : null;
      const isInteractive = Boolean(target && target.closest(interactiveSelector));
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursor.classList.toggle('is-expanded', isInteractive);
      cursor.classList.add('is-visible');
    }

    function hideCursor() {
      cursor.classList.remove('is-visible');
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', hideCursor);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', hideCursor);
    };
  }, []);

  return <span ref={cursorRef} className="cursor-follower" aria-hidden="true" />;
}