import { useState, useEffect } from 'react';

type Theme = 'professional' | 'whimsical' | 'retro';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('site-theme');
    return (savedTheme as Theme) || 'professional';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
