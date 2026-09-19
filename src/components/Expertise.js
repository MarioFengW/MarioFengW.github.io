import React, { useEffect, useRef } from 'react';
import { expertise } from '../data/content';
import SectionHeading from './SectionHeading';

const MAX_TILT = 10;

export default function Expertise() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const cleanups = cardRefs.current.map((card, index) => {
      if (!card) return null;

      const tiltEffect = index % 2 === 0 ? 'reverse' : 'normal';
      const factor = tiltEffect === 'reverse' ? 1 : -1;

      function handleMouseMove(event) {
        const bounds = card.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width - 0.5;
        const py = (event.clientY - bounds.top) / bounds.height - 0.5;
        const x = px * MAX_TILT * 2 * factor;
        const y = -py * MAX_TILT * 2 * factor;

        card.style.setProperty('--rY', x.toFixed(2));
        card.style.setProperty('--rX', y.toFixed(2));
        card.style.setProperty('--bY', `${80 - x / 4}%`);
        card.style.setProperty('--bX', `${50 - y / 4}%`);
      }

      function handleMouseEnter() {
        card.classList.add('expertise-card-active');
      }

      function handleMouseLeave() {
        card.classList.remove('expertise-card-active');
        card.style.setProperty('--rX', '0');
        card.style.setProperty('--rY', '0');
        card.style.setProperty('--bY', '80%');
        card.style.setProperty('--bX', '50%');
      }

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup?.());
  }, []);

  return (
    <section id="expertise">
      <SectionHeading kicker="expertise">My Expertise</SectionHeading>
      <div className="expertise-grid">
        {expertise.map((item, index) => (
          <article
            className={`expertise-card expertise-card-${index + 1}`}
            key={item.title}
            ref={(card) => {
              cardRefs.current[index] = card;
            }}
          >
            <div className="expertise-card-inner">
              <div className="expertise-index">0{index + 1}</div>
              <h3>
                <span>{item.title.split(' ')[0]}</span>{' '}
                {item.title.split(' ').slice(1).join(' ')}
              </h3>
              <p>{item.description}</p>
              <span className="tag">{item.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
