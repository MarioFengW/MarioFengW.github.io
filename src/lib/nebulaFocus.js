// One nebula for the whole page. Sections register what shape the gas should
// take while they are the active one; the page nebula morphs between them.
// A tiny store with no DOM access, so it is easy to test.
import { quietGas } from './stages';

export const DEFAULT_FOCUS = { key: 'quiet', shape: quietGas, label: '' };

const sections = new Map(); // id -> () => focus
const listeners = new Set();
let activeId = null;
let current = DEFAULT_FOCUS;
let paused = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function recompute() {
  const getter = sections.get(activeId);
  const next = (getter && getter()) || DEFAULT_FOCUS;
  if (next.key !== current.key) {
    current = next;
    notify();
  }
}

/** Register a section; `getter` returns its current focus. Returns an unregister function. */
export function registerSection(id, getter) {
  sections.set(id, getter);
  recompute();
  return () => {
    if (sections.get(id) === getter) sections.delete(id);
    recompute();
  };
}

/** A section's internal state changed (a step, a hovered entry, a card, the weather). */
export function refreshFocus() {
  recompute();
}

export function setActiveSection(id) {
  if (id === activeId) return;
  activeId = id;
  recompute();
}

export function registeredSections() {
  return [...sections.keys()];
}

export function getFocus() {
  return current;
}

export function isPaused() {
  return paused;
}

export function setPaused(value) {
  if (value === paused) return;
  paused = value;
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** For tests: forget every section and go back to the default focus. */
export function resetFocus() {
  sections.clear();
  activeId = null;
  current = DEFAULT_FOCUS;
  paused = false;
  notify();
}
