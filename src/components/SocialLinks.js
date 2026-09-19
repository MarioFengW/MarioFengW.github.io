import React from 'react';
import '../styles/icon.css';

const links = [
  { label: 'E-mail', icon: '/icons/envelope.png', href: 'mailto:mario.fengw@gmail.com' },
  { label: 'GitHub', icon: '/icons/github.png', href: 'https://github.com/MarioFengW' },
  { label: 'LinkedIn', icon: '/icons/linkedin.png', href: 'https://www.linkedin.com/in/mariofengwu/' },
  { label: 'Discord', icon: '/icons/discord.png', href: 'https://discord.com/users/1162141976813117490', invert: true },
  { label: 'Instagram', icon: '/icons/instagram.png', href: 'https://www.instagram.com/takatakata.195?stkn=cjJyenJrZm92dWVy', invert: true },
  { label: 'Facebook', icon: '/icons/facebook-square.png', href: 'https://www.facebook.com/share/19M41BFzVB/', invert: true },
  { label: 'Gaming', icon: '/icons/gaming.png', href: 'https://steamcommunity.com/profiles/76561199147883762/', invert: true },
];

export default function SocialLinks() {
  return (
    <div className="socials">
      {links.map((link) => (
        <a key={link.label} href={link.href} aria-label={link.label}>
          <img
            className={`social-icon${link.invert ? ' social-icon--invert' : ''}`}
            src={link.icon}
            alt=""
            aria-hidden="true"
          />
        </a>
      ))}
    </div>
  );
}