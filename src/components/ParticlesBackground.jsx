import React, { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 55,
        density: { enable: true, area: 800 },
      },
      color: { value: '#657EA4' },
      links: {
        enable: true,
        distance: 100,
        color: '#657EA4',
        opacity: 0.35,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        outModes: { default: 'bounce' },
      },
      opacity: { value: 0.5 },
      size: { value: 2 },
    },
    detectRetina: true,
  }), []);

  return (
    <Particles
      id="tsparticles"
      className="particles-background"
      init={particlesInit}
      options={options}
    />
  );
}
