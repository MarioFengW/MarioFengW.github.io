import React from 'react';
import { socials } from '../data/content';

function isExternal(href) {
  return /^https?:\/\//.test(href);
}

export default function SocialLinks({ primaryOnly = false, className = '' }) {
  const links = primaryOnly ? socials.filter((link) => link.primary) : socials;
  return (
    <ul className={`socials ${className}`.trim()}>
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            {...(isExternal(link.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span aria-hidden="true">[</span>
            {link.label}
            <span aria-hidden="true">]</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
