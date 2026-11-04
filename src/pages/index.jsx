import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Expertise from '../components/Expertise';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import BootScreen from '../components/BootScreen';
import PageNebula from '../components/PageNebula';

export default function HomePage() {
  return (
    <>
      {/* Skip link must act instantly, so it opts out of the section transition. */}
      <a className="skip-link" href="#about" data-no-transition="">Skip to content</a>
      <PageNebula />
      <PageTransition />
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
      <BootScreen />
    </>
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
