import React, { useCallback, useRef } from 'react';
import { NEBULA_LAYERS, renderNebulaLayers } from '../lib/nebula';
import useAsciiLoop, { fieldOffset } from '../hooks/useAsciiLoop';
import { frameRates } from '../lib/motion-tokens';

/**
 * Animated ASCII nebula: drifting gas in four colour layers (dust, blue, rose,
 * hot core) with twinkling stars. The pointer swirls and brightens the gas.
 * Purely decorative. `playing` is controlled by the parent (pause button /
 * reduced motion); when paused it keeps showing the last frame.
 *
 * `shapeFor(cols, rows, t)` may return a density multiplier `(x, y) => m` that
 * sculpts the gas for that frame. `redrawKey` repaints a paused field.
 */
export default function AsciiField({
  className = '',
  playing = true,
  fps = frameRates.hero,
  shapeFor = null,
  redrawKey = null,
}) {
  const wrapRef = useRef(null);
  const layerRefs = useRef([]);
  const probeRef = useRef(null);
  const lineRef = useRef(0);
  const shapeRef = useRef(shapeFor);
  shapeRef.current = shapeFor;

  const draw = useCallback((cols, rows, t, pointer) => {
    if (!lineRef.current) lineRef.current = parseFloat(window.getComputedStyle(layerRefs.current[0]).lineHeight);
    const shape = shapeRef.current ? shapeRef.current(cols, rows, t) : null;
    const frames = renderNebulaLayers(cols, rows, t, pointer, shape, fieldOffset(wrapRef.current, lineRef.current));
    layerRefs.current.forEach((node, index) => {
      if (node) node.textContent = frames[index];
    });
  }, []);

  useAsciiLoop(wrapRef, probeRef, draw, { playing, fps, trackPointer: true, redrawKey });

  return (
    <div ref={wrapRef} className={`ascii-field ${className}`.trim()} aria-hidden="true">
      {NEBULA_LAYERS.map((name, index) => (
        <pre
          key={name}
          ref={(node) => {
            layerRefs.current[index] = node;
            if (index === 0) probeRef.current = node;
          }}
          className={`ascii-field-pre nebula-${name}`}
        />
      ))}
    </div>
  );
}
