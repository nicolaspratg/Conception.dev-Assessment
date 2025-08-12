import { writable } from 'svelte/store';

export type GenMode = 'legacy' | 'smart';

function createModeStore() {
  const initial: GenMode =
    (typeof localStorage !== 'undefined' && (localStorage.getItem('genMode') as GenMode)) || 'legacy';

  const _mode = writable<GenMode>(initial);
  let hydrated = false;

  // Fired on changes AFTER first hydration
  const _shouldShowToast = writable<{ open: boolean; mode: GenMode }>({ open: false, mode: initial });

  // Set hydrated to true after a short delay to ensure client-side rendering
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      hydrated = true;
      console.log('Store hydrated, ready to show toasts');
    }, 100);
  }

  _mode.subscribe((m) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('genMode', m);
    if (!hydrated) { 
      console.log('Store not hydrated yet, skipping toast');
      return; // don't show on initial render
    }
    console.log('Mode changed to:', m, 'showing toast');
    _shouldShowToast.set({ open: true, mode: m });
  });

  return {
    mode: _mode,
    toast: _shouldShowToast,
    setMode: (m: GenMode) => _mode.set(m)
  };
}

export const gen = createModeStore();
export const genMode = gen.mode;      // readable
export const genToast = gen.toast;    // {open, mode}
export const setGenMode = gen.setMode;
