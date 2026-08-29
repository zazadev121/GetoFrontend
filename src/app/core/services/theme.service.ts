import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themeSignal = signal<ThemeMode>('dark');

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('geto_theme') as ThemeMode | null;
    // No stored choice? Follow the device. The warm-paper palette was designed
    // light-first, so most visitors land on the intended look.
    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialTheme: ThemeMode = savedTheme ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme);
  }

  toggleTheme() {
    const nextTheme: ThemeMode = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ThemeMode) {
    this.themeSignal.set(theme);
    localStorage.setItem('geto_theme', theme);

    const root = document.documentElement;
    document.querySelector('meta[name="theme-color"]:not([media])')
      ?.setAttribute('content', theme === 'light' ? '#F7F2E9' : '#15110E');
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }

  isDark(): boolean {
    return this.themeSignal() === 'dark';
  }
}
