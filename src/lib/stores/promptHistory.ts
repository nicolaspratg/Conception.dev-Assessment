import { writable } from 'svelte/store';

const KEY = 'promptHistory:v1';
type Item = { id: string; text: string; ts: number };

function load(): Item[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function save(items: Item[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50))); } catch {}
}

function createHistory() {
  const { subscribe, set, update } = writable<Item[]>([]);
  
  function init() {
    if (typeof window !== 'undefined') set(load());
  }
  
  function add(text: string) {
    if (!text?.trim()) return;
    update(curr => {
      const next = [{ id: crypto.randomUUID?.() || String(Date.now()), text: text.trim(), ts: Date.now() }, ...curr.filter(i => i.text !== text.trim())];
      save(next);
      return next;
    });
  }
  
  function remove(id: string) {
    update(curr => {
      const next = curr.filter(i => i.id !== id);
      save(next);
      return next;
    });
  }
  
  function clear() { 
    set([]); 
    save([]); 
  }
  
  return { subscribe, init, add, remove, clear };
}

export const promptHistory = createHistory();
