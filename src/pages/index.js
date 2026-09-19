import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Expertise from '../components/Expertise';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import CometRain from '../components/CometRain';
import CursorFollower from '../components/CursorFollower';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>Mario Feng Wu - AI/ML Engineer</title>
        <meta name="description" content="Portfolio of Mario Feng Wu, a computer science student and AI/ML developer." />
      </Helmet>
      <CometRain />
      <CursorFollower />
      <Header />
      <main className="wrap">
        <Hero />
        <About />
        <Expertise />
        <Experience />
        <Projects />
        <Footer />
      </main>
    </>
  );
}
