import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import Expertise from './Expertise';
import AsciiFlow from './AsciiFlow';
import { mockAnimationFrame, mockIntersectionObserver, mockReducedMotion } from '../test/browser';
import { getFocus, setActiveSection } from '../lib/nebulaFocus';

function placeSteps(container, centers) {
  container.querySelectorAll('.stage-step').forEach((step, index) => {
    step.getBoundingClientRect = () => ({ top: centers[index] - 100, height: 200 });
  });
}

describe('Expertise stage', () => {
  it('slides the track sideways with scroll and activates the step in front', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    const { container } = render(<Expertise />);
    const steps = container.querySelectorAll('.stage-step');
    expect(steps[0]).toHaveClass('is-active');

    vi.stubGlobal('innerHeight', 800);
    const pin = container.querySelector('.stage-pin');
    const track = container.querySelector('.stage-steps');
    pin.getBoundingClientRect = () => ({ top: -1600, height: 2400 }); // fully scrolled through
    [...track.children].forEach((step, i) => Object.defineProperty(step, 'offsetLeft', { value: 100 + i * 1000, configurable: true }));
    act(() => {
      io.trigger(true);
      raf.step(16);
    });
    expect(track.style.transform).toBe('translateX(-2000px)');
    expect(steps[2]).toHaveClass('is-active');
    setActiveSection(null);
    setActiveSection('expertise');
    expect(getFocus().label).toContain('deploy');
  });

  it('pinProgress maps the pinned scroll to 0..1', async () => {
    const { pinProgress } = await import('./Expertise');
    expect(pinProgress(0, 2400, 800)).toBe(0);
    expect(pinProgress(-800, 2400, 800)).toBe(0.5);
    expect(pinProgress(-5000, 2400, 800)).toBe(1);
    expect(pinProgress(0, 600, 800)).toBe(0);
  });
});

describe('AsciiFlow', () => {
  const lines = ['[a] -------> [b]'];

  it('is a still drawing with reduced motion', () => {
    mockReducedMotion(true);
    const { container } = render(<AsciiFlow lines={lines} />);
    expect(container.querySelector('.ascii-flow-base').textContent).toBe(lines[0]);
    expect(container.querySelector('.ascii-flow-head').textContent).toBe('');
  });

  it('animates packets only while on screen, and restores the drawing on unmount', () => {
    mockReducedMotion(false);
    const io = mockIntersectionObserver();
    const raf = mockAnimationFrame();
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { container, unmount } = render(<AsciiFlow lines={lines} />);
    const head = container.querySelector('.ascii-flow-head');

    raf.step(500);
    expect(head.textContent).toBe(''); // offscreen: nothing painted

    io.trigger(true);
    let painted = false;
    for (let t = 600; t < 3000 && !painted; t += 100) {
      now = t;
      raf.step(t);
      painted = head.textContent.includes('*');
    }
    expect(painted).toBe(true);

    const base = container.querySelector('.ascii-flow-base');
    unmount();
    expect(base.textContent).toBe(lines[0]);
    expect(raf.pending()).toBe(0);
  });
});

describe('Contact wiring', () => {
  it('ends one wire at each channel link', async () => {
    const { default: Footer } = await import('./Footer');
    const { CHANNELS: socials } = await import('./Footer');
    mockReducedMotion(true);
    const { container, getByRole } = render(<Footer />);
    const wires = container.querySelector('.contact-wires .ascii-flow-base').textContent.split('\n');
    expect(wires.filter((line) => line.trimEnd().endsWith('------>'))).toHaveLength(socials.length);
    socials.forEach((link) => {
      expect(getByRole('link', { name: new RegExp(link.label) })).toHaveAttribute('href', link.href);
    });
  });
});

describe('Contact composer', () => {
  it('keeps the send link in sync with what the visitor writes', async () => {
    const { default: Footer } = await import('./Footer');
    const { fireEvent, screen } = await import('@testing-library/react');
    mockReducedMotion(true);
    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText('your name'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByLabelText(/research/));
    fireEvent.change(screen.getByPlaceholderText('what are you working on?'), { target: { value: 'Hi' } });
    const send = screen.getByRole('link', { name: /send/ });
    expect(send.getAttribute('href')).toContain(encodeURIComponent('Research inquiry from Ana'));
    expect(send.getAttribute('href')).toContain('body=Hi');
  });

  it('copies the address and says so', async () => {
    const { default: Footer } = await import('./Footer');
    const { fireEvent, screen, findByText } = await import('@testing-library/react');
    mockReducedMotion(true);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: /copy/ }));
    expect(await screen.findByText('[ copied ]')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith('mario.fengw@gmail.com');
  });
});

