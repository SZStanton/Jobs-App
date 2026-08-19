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
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = theme === 'dark' ? 'light' : 'dark';

    // Only an actual choice is stored. Saving the inferred default would
    // freeze the system preference in place and ignore a later os change
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing can refuse to store. The theme still applies
    }

    // Kill transitions for two frames, or every element animates between the
    // two palettes at once and it reads as a flash
    root.classList.add('theme-switching');
    setTheme(next);

    const clear = () => root.classList.remove('theme-switching');
    requestAnimationFrame(() => requestAnimationFrame(clear));
    // rAF is throttled to nothing in a hidden tab, where the class would
    // otherwise stick and kill every transition on the page
    window.setTimeout(clear, 300);
  };

  return [theme, toggleTheme];
}
