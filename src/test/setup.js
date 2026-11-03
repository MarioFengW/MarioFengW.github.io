import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// jsdom lacks these browser APIs; tests that need behaviour override them.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
}

// Default: everything is "in view" shortly after being observed, like a tall
// browser window. Tests that need control use mockIntersectionObserver().
window.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
    this.active = true;
  }
  observe(target) {
    queueMicrotask(() => {
      if (this.active) this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this);
    });
  }
  unobserve() {}
  disconnect() {
    this.active = false;
  }
};
