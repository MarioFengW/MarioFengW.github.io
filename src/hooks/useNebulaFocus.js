import { useEffect, useRef } from 'react';
import { refreshFocus, registerSection } from '../lib/nebulaFocus';

/**
 * Tell the page nebula what shape to take while section `id` is the active one.
 * `focus` is `{ key, shape, label }`; a new `key` makes the gas re-form.
 */
export default function useNebulaFocus(id, focus) {
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useEffect(() => registerSection(id, () => focusRef.current), [id]);

  useEffect(() => {
    refreshFocus();
  }, [focus.key]);
}
