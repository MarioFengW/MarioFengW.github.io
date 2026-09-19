import React from 'react';

const navItems = ['about', 'expertise', 'experience', 'projects', 'contact'];

export default function Header() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <a className="nav-mark" href="#top">This is Mario Feng Wu</a>
        <nav className="links" aria-label="Primary navigation">
          {navItems.map((item) => <a key={item} href={`#${item}`}>{item}</a>)}
        </nav>
      </div>
    </header>
  );
}
