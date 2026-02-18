import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { getAvatarColor } from '../constants/app-data';

@Component({
  selector: 'app-parent-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex" style="background-color: var(--bg)">
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-[260px] border-r fixed h-full z-20 p-6"
             style="border-color: var(--border); background-color: var(--bg-card)">
        <a routerLink="/dashboard" class="flex items-center gap-3 mb-10" data-testid="sidebar-logo">
          <div class="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
          </div>
          <div>
            <h1 class="text-lg font-bold font-heading tracking-tight">Kids Money</h1>
            <p class="text-[10px] tracking-widest uppercase" style="color: var(--fg-muted)">Learn. Earn. Save.</p>
          </div>
        </a>

        @if (auth.kids().length > 0) {
          <div class="mb-8">
            <p class="text-xs uppercase tracking-wider mb-2 font-medium" style="color: var(--fg-muted)">Active Child</p>
            <select class="input" [value]="auth.selectedKid()?.id" (change)="selectKid($event)" data-testid="kid-selector">
              @for (kid of auth.kids(); track kid.id) {
                <option [value]="kid.id">{{ kid.name }}</option>
              }
            </select>
          </div>
        }

        <nav class="flex-1 space-y-1">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active-nav"
               [attr.data-testid]="'nav-' + item.label.toLowerCase()"
               class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all nav-item">
              <span [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="mt-auto space-y-2">
          <a routerLink="/settings" routerLinkActive="active-nav"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all nav-item" data-testid="nav-settings">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="2"/></svg>
            Settings
          </a>
          <button (click)="doLogout()" data-testid="logout-btn"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left nav-item text-red-500">
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Log Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-[260px] pb-20 lg:pb-0">
        <header class="sticky top-0 z-10 backdrop-blur-xl border-b px-4 lg:px-8 h-16 flex items-center justify-between"
                style="background-color: color-mix(in srgb, var(--bg) 80%, transparent); border-color: var(--border)">
          <div class="flex items-center gap-3">
            <button class="lg:hidden p-2 rounded-xl" style="color: var(--fg)" (click)="mobileMenu = !mobileMenu" data-testid="mobile-menu-btn">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
            <div class="hidden lg:block">
              <p class="text-sm" style="color: var(--fg-muted)">Welcome back,</p>
              <p class="text-sm font-semibold">{{ auth.parentProfile()?.full_name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            @if (auth.selectedKid(); as kid) {
              <div class="lg:hidden flex items-center gap-2 rounded-full px-3 py-1.5" style="background-color: var(--muted)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      [style.background-color]="getAvatarColor(kid.avatar)">{{ kid.name[0] }}</span>
                <span class="text-xs font-medium max-w-[60px] truncate">{{ kid.name }}</span>
              </div>
            }
            <button (click)="themeService.toggle()" class="p-2 rounded-xl" style="color: var(--fg-muted)" data-testid="theme-toggle">
              @if (themeService.theme() === 'light') {
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="2"/></svg>
              } @else {
                <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke-width="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="2"/></svg>
              }
            </button>
          </div>
        </header>

        <div class="p-4 lg:p-8 max-w-7xl mx-auto">
          <ng-content />
        </div>
      </main>

      <!-- Mobile Menu Overlay -->
      @if (mobileMenu) {
        <div class="fixed inset-0 z-30 lg:hidden" (click)="mobileMenu = false">
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="absolute left-0 top-0 bottom-0 w-[280px] p-6 animate-fade-in"
               style="background-color: var(--bg-card)" (click)="$event.stopPropagation()">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
              </div>
              <h1 class="text-lg font-bold font-heading">Kids Money</h1>
            </div>
            <nav class="space-y-1 mt-4">
              @for (item of allNavItems; track item.path) {
                <a [routerLink]="item.path" (click)="mobileMenu = false"
                   class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all nav-item">
                  <span [innerHTML]="item.icon"></span>
                  {{ item.label }}
                </a>
              }
            </nav>
          </div>
        </div>
      }

      <!-- Mobile Bottom Nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t px-2 py-2 safe-area-bottom"
           style="background-color: color-mix(in srgb, var(--bg-card) 90%, transparent); backdrop-filter: blur(12px); border-color: var(--border)">
        <div class="flex items-center justify-around">
          @for (item of mobileNavItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="text-primary" [attr.data-testid]="'mobile-nav-' + item.label.toLowerCase()"
               class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all text-xs" style="color: var(--fg-muted)">
              <span [innerHTML]="item.icon"></span>
              <span class="text-[10px] font-medium">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .nav-item { color: var(--fg-muted); }
    .nav-item:hover { color: var(--fg); background-color: var(--muted); }
    .active-nav { background-color: var(--color-primary) !important; color: white !important; }
    :host a.text-primary { color: var(--color-primary); }
  `]
})
export class ParentLayoutComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  mobileMenu = false;
  getAvatarColor = getAvatarColor;

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" stroke-width="2"/><rect x="14" y="3" width="7" height="5" rx="1" stroke-width="2"/><rect x="14" y="12" width="7" height="9" rx="1" stroke-width="2"/><rect x="3" y="16" width="7" height="5" rx="1" stroke-width="2"/></svg>' },
    { path: '/tasks', label: 'Tasks', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/></svg>' },
    { path: '/wallet', label: 'Wallet', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>' },
    { path: '/goals', label: 'Goals', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>' },
    { path: '/sip', label: 'Invest', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 6 23 6 23 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { path: '/loans', label: 'Borrow', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke-width="2"/></svg>' },
    { path: '/learning', label: 'Learn', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke-width="2"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke-width="2"/></svg>' },
  ];

  settingsNav = { path: '/settings', label: 'Settings', icon: '<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="2"/></svg>' };

  mobileNavItems = [
    this.navItems[0], this.navItems[1], this.navItems[2], this.navItems[6],
    { path: '/settings', label: 'More', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-width="2"/></svg>' },
  ];

  selectKid(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const kid = this.auth.kids().find(k => k.id === id);
    if (kid) this.auth.selectedKid.set(kid);
  }

  async doLogout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}
