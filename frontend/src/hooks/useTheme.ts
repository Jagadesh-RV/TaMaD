import { useCallback, useEffect, useState } from 'react';
import {
  type Theme,
  THEME_STORAGE_KEY,
  getStoredTheme,
  applyTheme,
  persistTheme,
  toggleTheme as flipTheme,
} from '../lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => flipTheme(prev));
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
