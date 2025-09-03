import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('dnd-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Default to dark theme for D&D sessions (low light environments)
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('dnd-theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}