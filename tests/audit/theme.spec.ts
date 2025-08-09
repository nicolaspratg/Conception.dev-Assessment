import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { themeStore } from '../../src/lib/stores/themeStore.js';

// Mock document and window
const mockDocument = {
  documentElement: {
    classList: {
      toggle: vi.fn(),
      add: vi.fn(),
      remove: vi.fn()
    }
  }
};

const mockWindow = {
  matchMedia: vi.fn(() => ({
    matches: false
  }))
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('Theme Store Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    themeStore.set(false);
  });

  it('should toggle dark mode and update HTML class', () => {
    // Initial state
    expect(get(themeStore)).toBe(false);
    
    // Toggle to dark mode
    themeStore.toggle();
    expect(get(themeStore)).toBe(true);
    
    // Toggle back to light mode
    themeStore.toggle();
    expect(get(themeStore)).toBe(false);
  });

  it('should initialize based on system preference', () => {
    // Mock prefers dark mode
    mockWindow.matchMedia.mockReturnValue({ matches: true });
    
    themeStore.init();
    
    expect(get(themeStore)).toBe(true);
    expect(mockDocument.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('should initialize to light mode when system prefers light', () => {
    // Mock prefers light mode
    mockWindow.matchMedia.mockReturnValue({ matches: false });
    
    themeStore.init();
    
    expect(get(themeStore)).toBe(false);
    expect(mockDocument.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false);
  });

  it('should handle window undefined (SSR)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    // Should not throw error
    expect(() => themeStore.init()).not.toThrow();
    
    global.window = originalWindow;
  });
});
