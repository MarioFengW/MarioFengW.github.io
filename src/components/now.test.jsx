import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Now from './Now';
import Expertise from './Expertise';
import Projects from './Projects';
import Footer from './Footer';
import { now, projects } from '../data/content';

describe('Now', () => {
  it('shows the current week of the term', () => {
    render(<Now date={new Date('2026-11-04T12:00:00')} />);
    expect(screen.getByText(/week 9\/16/)).toBeInTheDocument();
  });

  it('marks the term complete after the last week', () => {
    render(<Now date={new Date('2027-02-01T12:00:00')} />);
    expect(screen.getByText(/term complete/)).toBeInTheDocument();
  });

  it('says the term starts soon before it begins', () => {
    render(<Now date={new Date('2026-08-01T12:00:00')} />);
    expect(screen.getByText('starts soon')).toBeInTheDocument();
  });

  it('lists every course and running project', () => {
    render(<Now date={new Date('2026-11-04T12:00:00')} />);
    now.courses.forEach((course) => expect(screen.getByText(course.title)).toBeInTheDocument());
    now.building.forEach((item) => expect(screen.getByText(item, { exact: false })).toBeInTheDocument());
  });

  it('falls back to today when no date is given', () => {
    const { container } = render(<Now />);
    expect(container.querySelector('.now-bar').textContent).toMatch(/\[[#.]+\]/);
  });
});

describe('ASCII additions', () => {
  it('draws the expertise pipeline from data to deploy', () => {
    const { container } = render(<Expertise />);
    expect(container.querySelector('.pipeline-wire').textContent).toBe('[ data ] ----> [ model ] ----> [ app ] ----> [ deploy ]');
  });

  it('draws a diagram for each project that has one', () => {
    const { container } = render(<Projects />);
    expect(container.querySelectorAll('.project-diagram')).toHaveLength(projects.filter((p) => p.diagram).length);
  });

  it('draws the skyline in the footer, hidden from assistive tech', () => {
    const { container } = render(<Footer />);
    const skyline = container.querySelector('.skyline');
    expect(skyline).toHaveAttribute('aria-hidden', 'true');
    expect(skyline.textContent.split('\n')).toHaveLength(8);
  });
});
