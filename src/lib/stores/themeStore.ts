import { writable } from 'svelte/store';

function createThemeStore() {
  const { subscribe, set, update } = writable(false);

  return {
    subscribe,
    toggle: () => update(n => !n),
    set,
    init: () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        set(prefersDark);
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    }
  };
}

export const themeStore = createThemeStore();
