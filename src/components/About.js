import React from 'react';
import WeatherCards from './WeatherCards';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-label">#About</div>
      <WeatherCards />
    </section>
  );
}