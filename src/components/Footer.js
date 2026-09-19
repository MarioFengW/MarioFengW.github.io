import React from 'react';
import SocialLinks from './SocialLinks';
import { profile } from '../data/content';

export default function Footer() {
  return (
    <footer id="contact">
      <span className="kicker">#contact</span>
      <h2>Let's talk</h2>
      <p>
      Open to internships, professional opportunities, freelance, and research collaborations in 
      Artificial Intelligence, Machine Learning, full-stack software development, and DevOps engineering. 
      The best way to reach me is via email or GitHub.
      </p>
      <SocialLinks />
      <div className="copyright">
        <span>© 2026 Mario Feng Wu</span>
        <span>{profile.location}</span>
      </div>
    </footer>
  );
}
