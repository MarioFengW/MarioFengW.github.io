import { describe, expect, it } from 'vitest';
import { currentCity, experience, expertise, facts, profile, projects, socials } from './content';

describe('content data', () => {
  it('has the profile fields the hero and footer render', () => {
    ['name', 'role', 'summary', 'status', 'intro', 'location', 'email'].forEach((key) => {
      expect(profile[key], key).toBeTruthy();
    });
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it('every project has a unique title and an https link', () => {
    const titles = projects.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
    projects.forEach((project) => {
      expect(project.link, project.title).toMatch(/^https:\/\//);
      expect(project.description).toBeTruthy();
      expect(project.stack.length).toBeGreaterThan(0);
    });
  });

  it('every experience entry has a unique period+title key', () => {
    const keys = experience.map((item) => `${item.period}-${item.title}`);
    expect(new Set(keys).size).toBe(keys.length);
    experience.forEach((item) => {
      if (item.link) expect(item.link).toMatch(/^https:\/\//);
    });
  });

  it('expertise, facts and socials are well formed', () => {
    expect(expertise).toHaveLength(3);
    facts.forEach((fact) => {
      expect(fact.key).toMatch(/^[a-z_]+$/);
      expect(fact.value).toBeTruthy();
    });
    const labels = socials.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(socials.filter((s) => s.primary).map((s) => s.label)).toEqual(['email', 'github', 'linkedin']);
    socials.forEach((s) => expect(s.href).toMatch(/^(https:\/\/|mailto:)/));
  });

  it('the weather city has valid coordinates and a time zone', () => {
    expect(Math.abs(currentCity.latitude)).toBeLessThanOrEqual(90);
    expect(Math.abs(currentCity.longitude)).toBeLessThanOrEqual(180);
    expect(() => new Intl.DateTimeFormat('en', { timeZone: currentCity.timeZone })).not.toThrow();
  });
});
