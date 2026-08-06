import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { THEME_STORAGE_KEY, getStoredTheme, applyTheme, persistTheme, toggleTheme } from '../theme';

const mockMatchMedia = (matches: boolean) => {
  const original = window.matchMedia;
  window.matchMedia = vi.fn().mockReturnValue({ matches, media: '', onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }) as any;
  return () => { window.matchMedia = original; };
};

describe('theme lib', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the stored theme when valid', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'nonsense');
    const restore = mockMatchMedia(false);
    expect(getStoredTheme()).toBe('light');
    restore();
  });

  it('falls back to the system dark preference when nothing is stored', () => {
    const restore = mockMatchMedia(true);
    expect(getStoredTheme()).toBe('dark');
    restore();
  });

  it('falls back to light when the system prefers light', () => {
    const restore = mockMatchMedia(false);
    expect(getStoredTheme()).toBe('light');
    restore();
  });

  it('applyTheme sets the dark class and data-theme attribute', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('persistTheme stores the chosen theme', () => {
    persistTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('toggleTheme flips between light and dark', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});
