import React, { useCallback, useEffect, useRef } from 'react';
import { NEBULA_LAYERS, renderNebulaLayers } from '../lib/nebula';
import { stageShape } from '../lib/stages';
import useAsciiLoop from '../hooks/useAsciiLoop';

const MORPH_S = 0.7; // seconds for the gas to re-form into the next shape
const WIDE_COLS = 100; // cells across at which the shape moves to the left
const REGION = 0.5; // share of the width the shape occupies on wide screens
const THIN = 0.3; // gas density multiplier behind the text column

/**
 * The hero's nebula, sculpted: the same gas takes the shape of the active
 * stage (clusters, layers, containers) and flows from one shape to the next.
 * Decorative; the steps beside it carry the content.
 */
export default function NebulaStage({ stage = 0, playing = true }) {
  const wrapRef = useRef(null);
  const probeRef = useRef(null);
  const layerRefs = useRef([]);
  const morphRef = useRef({ from: stage, to: stage, start: null });

  useEffect(() => {
    const morph = morphRef.current;
    if (morph.to === stage) return;
    morphRef.current = { from: morph.to, to: stage, start: null };
  }, [stage]);

  const draw = useCallback(
    (cols, rows, t) => {
      const morph = morphRef.current;
      if (morph.start === null) morph.start = t;
      const k = playing ? Math.min(1, (t - morph.start) / MORPH_S) : 1;
      // Wide screens: the shape lives on the left, the text column on the right
      // keeps only thin gas. Narrow screens: the shape uses the full width.
      const region = cols >= WIDE_COLS ? Math.round(cols * REGION) : cols;
      const inner = stageShape(region, rows, t, morph.to, morph.from, k);
      const shape = region === cols ? inner : (x, y) => (x < region ? inner(x, y) : THIN);
      const frames = renderNebulaLayers(cols, rows, t, null, shape);
      layerRefs.current.forEach((node, index) => {
        if (node) node.textContent = frames[index];
      });
    },
    [playing]
  );

  // Paused (reduced motion): repaint once per stage change instead of animating.
  useAsciiLoop(wrapRef, probeRef, draw, { playing, fps: 20, redrawKey: playing ? null : stage });

  return (
    <div ref={wrapRef} className="ascii-field nebula-stage" aria-hidden="true">
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
