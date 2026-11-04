import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import Header, { navItems } from './Header';
import Hero from './Hero';
import About from './About';
import Expertise from './Expertise';
import Experience from './Experience';
import Projects, { ctaLabel, slugify } from './Projects';
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
  it('links to every section by name (no section numbers)', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    navItems.forEach((item) => {
      expect(within(nav).getByRole('link', { name: item })).toHaveAttribute('href', `#${item}`);
    });
    expect(nav.textContent).not.toMatch(/0\d/);
  });

  it('includes the black/white theme switch', () => {
    render(<Header />);
    expect(screen.getByRole('switch', { name: 'Light theme' })).toBeInTheDocument();
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
    fireEvent.click(within(nav).getByRole('link', { name: 'projects' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Hero', () => {
  it('shows name, role, summary and both calls to action, visible without any script', () => {
    const { container } = render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('MarioFeng Wu');
    expect(screen.getByText(profile.role)).toBeVisible();
    expect(screen.getByText(profile.summary)).toBeVisible();
    // No eyebrow above the heading, and nothing hidden waiting for an animation.
    expect(container.querySelector('.prompt')).toBeNull();
    expect(container.querySelector('.hero-content [style*="opacity"]')).toBeNull();
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
  it('renders the intro, the facts list and the live weather, with no stats band', () => {
    stubFailingFetch();
    const { container } = render(<About />);
    expect(screen.getByText(profile.intro)).toBeVisible();
    expect(screen.getByText('based_in')).toBeInTheDocument();
    expect(screen.getByText('Taipei')).toBeInTheDocument();
    expect(container.querySelector('.highlights')).toBeNull();
  });
});

describe('Expertise', () => {
  it('lists every area as a row with what and stack', () => {
    const { container } = render(<Expertise />);
    expect(container.querySelectorAll('.expertise-row')).toHaveLength(expertise.length);
    expertise.forEach((item) => {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
      expect(screen.getByText(item.tag)).toBeInTheDocument();
    });
  });
});

describe('Experience', () => {
  it('opens the first entry by default and works as an accordion', () => {
    render(<Experience />);
    const buttons = screen.getAllByRole('button');
    const panel = (index) => document.getElementById(buttons[index].getAttribute('aria-controls'));
    expect(buttons).toHaveLength(experience.length);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    expect(panel(0)).not.toHaveAttribute('inert');
    expect(panel(1)).toHaveAttribute('inert'); // closed panels are out of the a11y tree

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(panel(0)).toHaveAttribute('inert');
    expect(panel(1)).not.toHaveAttribute('inert');
    expect(panel(1)).toHaveTextContent(experience[1].description);

    fireEvent.click(buttons[1]);
    buttons.forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'));
  });

  it('shows each entry\'s impact metric in its header', () => {
    render(<Experience />);
    experience.filter((item) => item.metric).forEach((item) => {
      expect(screen.getByText(item.metric)).toBeInTheDocument();
    });
  });

  it('links each organisation externally', () => {
    render(<Experience />);
    const link = screen.getByRole('link', { name: new RegExp(experience[0].linkLabel) });
    expect(link).toHaveAttribute('href', experience[0].link);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Projects', () => {
  it('renders one card per project with position, metric and a labelled external CTA', () => {
    render(<Projects />);
    projects.forEach((project, index) => {
      const card = screen.getByRole('article', { name: project.title });
      expect(within(card).getByText(`${index + 1}/${projects.length}`)).toBeInTheDocument();
      expect(within(card).getByText(`./${slugify(project.title)}`)).toBeInTheDocument();
      if (project.metric) expect(within(card).getByText(project.metric)).toBeInTheDocument();
      const cta = within(card).getByRole('link', { name: new RegExp(`${project.title}: ${ctaLabel(project.link)}`) });
      expect(cta).toHaveAttribute('href', project.link);
      expect(cta).toHaveAttribute('target', '_blank');
      expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('slugify produces path-like names', () => {
    expect(slugify('In & Out')).toBe('in-and-out');
    expect(slugify('Connect the Schools')).toBe('connect-the-schools');
    expect(slugify('  Hack2Dawn!  ')).toBe('hack2dawn');
  });

  it('labels repositories and live sites differently', () => {
    expect(ctaLabel('https://github.com/JRV-XVI/in-and-out')).toBe('view source');
    expect(ctaLabel('https://hack.pawnguard.org')).toBe('visit site');
  });
});

describe('Footer', () => {
  it('puts the email front and centre, without an eyebrow', () => {
    const { container } = render(<Footer />);
    expect(screen.getByRole('heading', { level: 2, name: 'Get in touch' })).toBeInTheDocument();
    expect(container.querySelector('.kicker')).toBeNull();
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
    expect(container.querySelector('.kicker')).toBeNull();
  });

  it('Head sets title, description, canonical and Open Graph tags without third-party fonts', () => {
    const { container } = render(<Head />);
    expect(container.querySelector('link[href*="fonts.googleapis"]')).toBeNull();
    expect(container.querySelector('title')).toHaveTextContent('Mario Feng Wu');
    expect(container.querySelector('meta[name="description"]').getAttribute('content')).toMatch(/machine-learning/);
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://mariofengw.github.io/');
    expect(container.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(container.querySelector('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  });
});
