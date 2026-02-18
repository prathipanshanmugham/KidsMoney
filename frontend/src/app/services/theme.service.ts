import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>(this.getStoredTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(t);
      localStorage.setItem('km_theme', t);
    });
  }

  private getStoredTheme(): 'light' | 'dark' {
    return (localStorage.getItem('km_theme') as 'light' | 'dark') || 'light';
  }

  toggle() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }
}
