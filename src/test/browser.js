import { vi } from 'vitest';

/** Replace window.matchMedia; returns a function that flips the media state. */
export function mockReducedMotion(initial = false) {
  const listeners = new Set();
  const media = {
    matches: initial,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
  };
  vi.spyOn(window, 'matchMedia').mockImplementation(() => media);
  return (next) => {
    media.matches = next;
    listeners.forEach((fn) => fn());
  };
}

/** Controllable IntersectionObserver; `trigger(isIntersecting)` fires every observer. */
export function mockIntersectionObserver() {
  const instances = [];
  class FakeObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = [];
      this.disconnected = false;
      instances.push(this);
    }
    observe(target) { this.targets.push(target); }
    unobserve() {}
    disconnect() { this.disconnected = true; }
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  return {
    instances,
    trigger(isIntersecting) {
      instances
        .filter((o) => !o.disconnected)
        .forEach((o) => o.callback(o.targets.map((target) => ({ target, isIntersecting }))));
    },
  };
}

/** Manual requestAnimationFrame: `step(time)` runs queued callbacks once. */
export function mockAnimationFrame() {
  let queue = [];
  let id = 0;
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    id += 1;
    queue.push({ id, cb });
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (cancelId) => {
    queue = queue.filter((entry) => entry.id !== cancelId);
  });
  return {
    pending: () => queue.length,
    step(time) {
      const current = queue;
      queue = [];
      current.forEach((entry) => entry.cb(time));
    },
  };
}
