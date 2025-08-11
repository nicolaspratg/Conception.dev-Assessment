import { writable } from 'svelte/store';

const KEY = 'theme:dark';

function apply(isDark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark);
  }
}

function createThemeStore() {
  const { subscribe, set, update } = writable(false);

  function init() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(KEY);
    const system = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const isDark = saved === 'true' ? true : saved === 'false' ? false : system;
    set(isDark);
    apply(isDark);
  }

  function toggle() {
    update(prev => {
      const next = !prev;
      localStorage.setItem(KEY, String(next));
      apply(next);
      return next;
    });
  }

  function setValue(v: boolean) {
    localStorage.setItem(KEY, String(v));
    set(v);
    apply(v);
  }

  return { subscribe, init, toggle, set: setValue };
}

export const themeStore = createThemeStore();
