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
    const initialTheme: ThemeMode = savedTheme || 'dark';
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
