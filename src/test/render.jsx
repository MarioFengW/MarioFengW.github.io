import React from 'react';
import { render } from '@testing-library/react';
import MotionProvider from '../components/MotionProvider';

/** Render inside the same motion provider the page uses. */
export function renderWithMotion(ui, options) {
  return render(ui, { wrapper: MotionProvider, ...options });
}
