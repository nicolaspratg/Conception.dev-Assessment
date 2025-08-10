// src/lib/stores/viewport.ts
import { readable } from 'svelte/store';

export const bottomInset = readable(0, (set) => {
  if (typeof window === 'undefined' || !window.visualViewport) {
    set(0);
    return () => {};
  }
  const vv = window.visualViewport;

  const update = () => {
    // How much of the page bottom is covered by browser UI
    const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    set(Math.round(inset));
  };

  update();
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);

  return () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
  };
});
