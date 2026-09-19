import React from 'react';

export default function SectionHeading({ kicker, children }) {
  return (
    <div className="section-head">
      <span className="kicker">#{kicker}</span>
      <h2>{children}</h2>
      <span className="heading-rule" aria-hidden="true" />
    </div>
  );
}
