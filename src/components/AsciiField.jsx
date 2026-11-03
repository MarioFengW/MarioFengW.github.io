import React, { useCallback, useRef } from 'react';
import { NEBULA_LAYERS, renderNebulaLayers } from '../lib/nebula';
import useAsciiLoop from '../hooks/useAsciiLoop';

/**
 * Animated ASCII nebula: drifting gas in four colour layers (dust, blue, rose,
 * hot core) with twinkling stars. The pointer swirls and brightens the gas.
 * Purely decorative. `playing` is controlled by the parent (pause button /
 * reduced motion); when paused it keeps showing the last frame.
 */
export default function AsciiField({ className = '', playing = true }) {
  const wrapRef = useRef(null);
  const layerRefs = useRef([]);
  const probeRef = useRef(null);

  const draw = useCallback((cols, rows, t, pointer) => {
    const frames = renderNebulaLayers(cols, rows, t, pointer);
    layerRefs.current.forEach((node, index) => {
      if (node) node.textContent = frames[index];
    });
  }, []);

  useAsciiLoop(wrapRef, probeRef, draw, { playing, fps: 24, trackPointer: true });

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
