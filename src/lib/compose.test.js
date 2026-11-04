import { describe, expect, it } from 'vitest';
import { composeMailto, composeSubject, localTime, TOPICS } from './compose';

describe('compose', () => {
  it('builds the subject from topic and name', () => {
    expect(composeSubject('research', 'Ana')).toBe('Research inquiry from Ana');
    expect(composeSubject('internship', '  ')).toBe('Internship inquiry');
    expect(composeSubject('just saying hi', 'Li')).toBe('Hello from Li');
    expect(TOPICS).toContain('freelance');
  });

  it('encodes subject and body into a mailto link', () => {
    const href = composeMailto('a@b.co', { topic: 'freelance', name: 'Zoë', message: 'Hi & bye?' });
    expect(href).toBe(`mailto:a@b.co?subject=${encodeURIComponent('Freelance inquiry from Zoë')}&body=${encodeURIComponent('Hi & bye?')}`);
    expect(composeMailto('a@b.co', { topic: 'research', name: '', message: ' ' })).toBe('mailto:a@b.co?subject=Research%20inquiry');
  });

  it('formats a local time in a time zone', () => {
    expect(localTime(new Date('2026-11-05T14:48:00Z'), 'Asia/Taipei')).toBe('22:48');
  });
});
