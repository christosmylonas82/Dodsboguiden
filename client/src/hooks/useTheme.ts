import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'dodsboguiden_theme';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'auto';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolveTheme(theme));

    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange() {
      document.documentElement.setAttribute('data-theme', resolveTheme('auto'));
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { theme, setTheme };
}
