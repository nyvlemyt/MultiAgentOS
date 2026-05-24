'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const initial = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ?? 'dark';
    setTheme(initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[color:var(--bg-hover)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
