import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Expertise from '../components/Expertise';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import MotionProvider from '../components/MotionProvider';

export default function HomePage() {
  return (
    <MotionProvider>
      <a className="skip-link" href="#about">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <div className="wrap">
          <About />
          <Expertise />
          <Experience />
          <Projects />
          <Footer />
        </div>
      </main>
    </MotionProvider>
  );
}

const TITLE = 'Mario Feng Wu · AI/ML Engineer';
const DESCRIPTION =
  'Portfolio of Mario Feng Wu, a computer science student building machine-learning models and the full-stack, cloud-deployed products around them.';
const URL = 'https://mariofengw.github.io/';

export function Head() {
  return (
    <>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta name="theme-color" content="#0b0d10" />
      <meta name="color-scheme" content="dark" />
      <link rel="canonical" href={URL} />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={URL} />
      <meta name="twitter:card" content="summary" />
    </>
  );
}
