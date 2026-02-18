import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { KID_THEMES } from '../constants/app-data';

interface NavItem { path: string; label: string; icon: string; safeIcon?: SafeHtml; }

@Component({
  selector: 'app-kid-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex" [style.background]="'linear-gradient(135deg, ' + theme().primary + '08, ' + theme().secondary + '05)'">
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-[260px] border-r fixed h-full z-20 p-6"
             style="border-color: var(--border); background-color: color-mix(in srgb, var(--bg-card) 60%, transparent); backdrop-filter: blur(12px)">
        <div class="flex items-center gap-3 mb-10" data-testid="kid-sidebar-logo">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center" [style.background-color]="theme().primary">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
          </div>
          <div>
            <h1 class="text-lg font-bold font-heading tracking-tight">Kids Money</h1>
            <p class="text-[10px] tracking-widest uppercase" style="color: var(--fg-muted)">Hello, {{ kidName() }}!</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="kid-active"
               [attr.data-testid]="'kid-nav-' + item.label.toLowerCase().replace(' ', '-')"
               class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all kid-nav-item">
              <span [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <button (click)="doLogout()" data-testid="kid-logout-btn"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left text-red-500 mt-auto">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Log Out
        </button>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-[260px] pb-20 lg:pb-0">
        <header class="sticky top-0 z-10 backdrop-blur-xl border-b px-4 lg:px-8 h-16 flex items-center justify-between"
                style="background-color: color-mix(in srgb, var(--bg) 80%, transparent); border-color: var(--border)">
          <div class="flex items-center gap-3">
            <button class="lg:hidden p-2 rounded-xl" (click)="mobileMenu = !mobileMenu" data-testid="kid-mobile-menu">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <div class="lg:hidden flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center" [style.background-color]="theme().primary">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/></svg>
              </div>
              <span class="font-bold font-heading text-sm">Hi, {{ kidName() }}!</span>
            </div>
            <div class="hidden lg:block">
              <p class="text-sm" style="color: var(--fg-muted)">Welcome back,</p>
              <p class="text-sm font-semibold">{{ kidName() }}</p>
            </div>
          </div>
          <button (click)="themeService.toggle()" class="p-2 rounded-xl" style="color: var(--fg-muted)" data-testid="kid-theme-toggle">
            @if (themeService.theme() === 'light') {
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="2"/></svg>
            } @else {
              <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke-width="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" stroke-width="2"/></svg>
            }
          </button>
        </header>
        <div class="p-4 lg:p-8 max-w-7xl mx-auto"><ng-content /></div>
      </main>

      <!-- Mobile Menu -->
      @if (mobileMenu) {
        <div class="fixed inset-0 z-30 lg:hidden" (click)="mobileMenu = false">
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="absolute left-0 top-0 bottom-0 w-[280px] p-6 animate-fade-in"
               style="background-color: var(--bg-card)" (click)="$event.stopPropagation()">
            <nav class="space-y-1 mt-4">
              @for (item of navItems; track item.path) {
                <a [routerLink]="item.path" (click)="mobileMenu = false"
                   class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all kid-nav-item">
                  <span [innerHTML]="item.icon"></span> {{ item.label }}
                </a>
              }
            </nav>
          </div>
        </div>
      }

      <!-- Mobile Bottom Nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t px-2 py-2"
           style="background-color: color-mix(in srgb, var(--bg-card) 90%, transparent); backdrop-filter: blur(12px); border-color: var(--border)">
        <div class="flex items-center justify-around">
          @for (item of mobileNavItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="kid-mob-active" [attr.data-testid]="'kid-mob-' + item.label.toLowerCase()"
               class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all" style="color: var(--fg-muted)">
              <span [innerHTML]="item.icon"></span>
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .kid-nav-item { color: var(--fg-muted); }
    .kid-nav-item:hover { color: var(--fg); background-color: var(--muted); }
    :host ::ng-deep .kid-active { color: white !important; }
    :host ::ng-deep .kid-mob-active { color: var(--color-primary); }
  `]
})
export class KidLayoutComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  mobileMenu = false;

  kidName = computed(() => this.auth.kidSession()?.kid?.name || 'Kid');
  theme = computed(() => {
    const t = this.auth.kidSession()?.kid?.ui_theme || 'neutral';
    return KID_THEMES[t] || KID_THEMES['neutral'];
  });

  navItems: NavItem[];
  mobileNavItems: NavItem[];

  constructor() {
    const s = (html: string) => this.sanitizer.bypassSecurityTrustHtml(html);
    const raw = [
      { path: '/kid/dashboard', label: 'Home', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" stroke-width="2"/><rect x="14" y="3" width="7" height="5" rx="1" stroke-width="2"/><rect x="14" y="12" width="7" height="9" rx="1" stroke-width="2"/><rect x="3" y="16" width="7" height="5" rx="1" stroke-width="2"/></svg>' },
      { path: '/kid/tasks', label: 'My Tasks', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4" stroke-width="2"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/></svg>' },
      { path: '/kid/wallet', label: 'My Wallet', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>' },
      { path: '/kid/goals', label: 'Goals', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>' },
      { path: '/kid/sip', label: 'Invest', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-width="2"/></svg>' },
      { path: '/kid/loans', label: 'Borrow', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke-width="2"/></svg>' },
      { path: '/kid/learning', label: 'Stories', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke-width="2"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke-width="2"/></svg>' },
      { path: '/kid/achievements', label: 'Achievements', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" stroke-width="2"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke-width="2"/></svg>' },
    ];
    this.navItems = raw.map(n => ({ ...n, safeIcon: s(n.icon) }));
    this.mobileNavItems = [this.navItems[0], this.navItems[1], this.navItems[2], this.navItems[6], this.navItems[7]];
  }

  async doLogout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
