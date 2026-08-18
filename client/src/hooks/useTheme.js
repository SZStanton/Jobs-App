import { useEffect, useState } from 'react';

const STORAGE_KEY = 'jobs-app-theme';

// matchMedia is missing in jsdom, so this has to survive without it
function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function storedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => storedTheme() || systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing can refuse to store. The theme still applies
    }
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;

    // Kill transitions for two frames, or every element animates between the
    // two palettes at once and it reads as a flash
    root.classList.add('theme-switching');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove('theme-switching')),
    );
  };

  return [theme, toggleTheme];
}
