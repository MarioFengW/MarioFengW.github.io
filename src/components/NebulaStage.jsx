import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NEBULA_LAYERS, renderNebulaLayers } from '../lib/nebula';
import { STAGE_SHAPES, stageShape } from '../lib/stages';
import useAsciiLoop, { fieldOffset } from '../hooks/useAsciiLoop';
import { frameRates } from '../lib/motion-tokens';

export const MORPH_S = 0.7; // seconds for the gas to re-form into the next shape
const WIDE_COLS = 140; // cells across (about 1100px) at which a side region applies
const THIN = 0.3; // gas density outside the shape's region

/**
 * The page's nebula, sculpted: the same page-wide gas (see `fieldOffset`) takes
 * the shape of the active stage and flows from one shape to the next. Used as a
 * full-bleed section background; decorative, the content on top carries meaning.
 *
 * `shapes`: shape factories (see src/lib/stages.js), indexed by `stage`.
 * `side`: 'full' (default) uses the whole width; 'right' keeps the shape on the
 * right half on wide screens, leaving the left for the content.
 */
export default function NebulaStage({ stage = 0, shapes = STAGE_SHAPES, side = 'full', playing = true, className = '' }) {
  const wrapRef = useRef(null);
  const probeRef = useRef(null);
  const layerRefs = useRef([]);
  const lineRef = useRef(0);
  const morphRef = useRef({ from: stage, to: stage, start: null });
  const [morphing, setMorphing] = useState(false);

  useEffect(() => {
    const morph = morphRef.current;
    if (morph.to === stage) return undefined;
    morphRef.current = { from: morph.to, to: stage, start: null };
    // Full frame rate only while the gas re-forms; idle drift is cheaper.
    setMorphing(true);
    const id = setTimeout(() => setMorphing(false), MORPH_S * 1000 + 50);
    return () => clearTimeout(id);
  }, [stage]);

  const draw = useCallback(
    (cols, rows, t, pointer) => {
      const morph = morphRef.current;
      if (morph.start === null) morph.start = t;
      const k = playing ? Math.min(1, (t - morph.start) / MORPH_S) : 1;
      const half = side === 'right' && cols >= WIDE_COLS ? Math.round(cols / 2) : 0;
      const inner = stageShape(cols - half, rows, t, morph.to, morph.from, k, shapes);
      const shape = half ? (x, y) => (x >= half ? inner(x - half, y) : THIN) : inner;
      if (!lineRef.current && probeRef.current) {
        lineRef.current = parseFloat(window.getComputedStyle(probeRef.current).lineHeight);
      }
      const offset = fieldOffset(wrapRef.current, lineRef.current);
      const frames = renderNebulaLayers(cols, rows, t, pointer, shape, offset);
      layerRefs.current.forEach((node, index) => {
        if (node) node.textContent = frames[index];
      });
    },
    [playing, shapes, side]
  );

  // Paused (reduced motion): repaint once per stage change instead of animating.
  useAsciiLoop(wrapRef, probeRef, draw, {
    playing,
    fps: morphing ? frameRates.morph : frameRates.field,
    trackPointer: true,
    redrawKey: playing ? null : stage,
  });

  return (
    <div ref={wrapRef} className={`ascii-field nebula-stage ${className}`.trim()} aria-hidden="true">
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
