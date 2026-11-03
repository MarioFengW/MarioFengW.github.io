import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import Header, { navItems } from './Header';
import Hero from './Hero';
import About from './About';
import Expertise from './Expertise';
import Experience from './Experience';
import Projects, { slugify } from './Projects';
import Footer from './Footer';
import SocialLinks from './SocialLinks';
import HomePage, { Head } from '../pages/index';
import { experience, expertise, profile, projects, socials } from '../data/content';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFailingFetch() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
}

describe('Header', () => {
  it('links to every section', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    navItems.forEach((item) => {
      expect(within(nav).getByRole('link', { name: new RegExp(item) })).toHaveAttribute('href', `#${item}`);
    });
  });

  it('mobile menu toggles, closes on Escape and on navigation', () => {
    render(<Header />);
    const toggle = screen.getByRole('button', { name: '[ menu ]' });
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('[ close ]');
    expect(nav).toHaveClass('is-open');

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    fireEvent.click(within(nav).getByRole('link', { name: /projects/ }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Hero', () => {
  it('shows the name as the only h1, the role and both calls to action', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('MarioFeng Wu');
    expect(screen.getByText(profile.role)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view projects/ })).toHaveAttribute('href', '#projects');
    expect(screen.getByRole('link', { name: /email me/ })).toHaveAttribute('href', `mailto:${profile.email}`);
  });
});

describe('SocialLinks', () => {
  it('renders only primary links in primary mode', () => {
    render(<SocialLinks primaryOnly />);
    expect(screen.getAllByRole('link')).toHaveLength(socials.filter((s) => s.primary).length);
  });

  it('opens external links in a new tab safely, but not mailto', () => {
    render(<SocialLinks />);
    expect(screen.getAllByRole('link')).toHaveLength(socials.length);
    const github = screen.getByRole('link', { name: /github/ });
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', { name: /email/ })).not.toHaveAttribute('target');
  });
});

describe('About', () => {
  it('renders the intro, the facts list and the weather widget', () => {
    stubFailingFetch();
    render(<About />);
    expect(screen.getByText(profile.intro)).toBeInTheDocument();
    expect(screen.getByText('based_in')).toBeInTheDocument();
    expect(screen.getByText('Taipei')).toBeInTheDocument();
  });
});

describe('Expertise', () => {
  it('lists every area with its stack tag', () => {
    render(<Expertise />);
    expertise.forEach((item) => {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.tag)).toBeInTheDocument();
    });
  });
});

describe('Experience', () => {
  it('opens the first entry by default and works as an accordion', () => {
    render(<Experience />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(experience.length);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(experience[0].description)).toBeVisible();

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(buttons[0].getAttribute('aria-controls'))).not.toBeVisible();
    expect(screen.getByText(experience[1].description)).toBeVisible();

    fireEvent.click(buttons[1]);
    buttons.forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'));
  });

  it('links each organisation externally', () => {
    render(<Experience />);
    const link = screen.getByRole('link', { name: new RegExp(experience[0].linkLabel) });
    expect(link).toHaveAttribute('href', experience[0].link);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Projects', () => {
  it('renders one external card per project', () => {
    render(<Projects />);
    projects.forEach((project) => {
      const heading = screen.getByRole('heading', { level: 3, name: new RegExp(project.title) });
      const link = heading.closest('a');
      expect(link).toHaveAttribute('href', project.link);
      expect(link).toHaveAttribute('target', '_blank');
      expect(screen.getByText(`./${slugify(project.title)}`)).toBeInTheDocument();
    });
  });

  it('slugify produces path-like names', () => {
    expect(slugify('In & Out')).toBe('in-and-out');
    expect(slugify('Connect the Schools')).toBe('connect-the-schools');
    expect(slugify('  Hack2Dawn!  ')).toBe('hack2dawn');
  });
});

describe('Footer', () => {
  it('puts the email front and centre', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { level: 2, name: 'Get in touch' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(profile.email) })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`
    );
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });
});

describe('HomePage', () => {
  it('renders every section with a matching nav target and a skip link', async () => {
    stubFailingFetch();
    const { container } = render(<HomePage />);
    await act(async () => {});
    ['top', ...navItems].forEach((id) => expect(container.querySelector(`#${id}`)).not.toBeNull());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#about');
  });

  it('Head sets title, description, canonical and Open Graph tags', () => {
    const { container } = render(<Head />);
    expect(container.querySelector('title')).toHaveTextContent('Mario Feng Wu');
    expect(container.querySelector('meta[name="description"]').getAttribute('content')).toMatch(/machine-learning/);
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://mariofengw.github.io/');
    expect(container.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(container.querySelector('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  });
});
