import React, { forwardRef } from 'react';
import { nebulaBar } from '../lib/nebulaBar';

/**
 * Progress drawn as nebula gas between brackets: dust, then denser gas, then a
 * bright head, then empty sky. Decorative (aria-hidden); parents that need the
 * value for assistive tech say it in words.
 */
const NebulaBar = forwardRef(function NebulaBar({ progress = 0, width = 16, className = '' }, ref) {
  const bar = nebulaBar(progress, width);
  return (
    <span ref={ref} className={`nebula-bar ${className}`.trim()} aria-hidden="true">
      <span className="nebula-bar-edge">[</span>
      <span className="nebula-bar-dust">{bar.dust}</span>
      <span className="nebula-bar-gas">{bar.gas}</span>
      <span className="nebula-bar-head">{bar.head}</span>
      <span className="nebula-bar-sky">{bar.sky}</span>
      <span className="nebula-bar-edge">]</span>
      <span className="nebula-bar-percent">{bar.percent}</span>
    </span>
  );
});

export default NebulaBar;
