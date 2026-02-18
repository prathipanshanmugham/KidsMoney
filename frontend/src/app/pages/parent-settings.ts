import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-parent-settings',
  standalone: true,
  imports: [CommonModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in max-w-2xl">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="settings-heading">Settings</h1>
        <p class="text-sm mb-8" style="color: var(--fg-muted)">Manage your preferences</p>

        <div class="card p-6 mb-4">
          <h3 class="font-semibold font-heading text-sm mb-4">Profile</h3>
          <div class="space-y-3">
            <div class="flex justify-between"><span class="text-sm" style="color: var(--fg-muted)">Name</span><span class="text-sm font-medium">{{ auth.parentProfile()?.full_name }}</span></div>
            <div class="flex justify-between"><span class="text-sm" style="color: var(--fg-muted)">Email</span><span class="text-sm font-medium">{{ auth.parentProfile()?.email }}</span></div>
          </div>
        </div>

        <div class="card p-6 mb-4">
          <h3 class="font-semibold font-heading text-sm mb-4">Appearance</h3>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Dark Mode</p>
              <p class="text-xs" style="color: var(--fg-muted)">Toggle light/dark theme</p>
            </div>
            <button (click)="themeService.toggle()" class="px-4 py-2 rounded-full text-sm font-medium border" style="border-color: var(--border)" data-testid="toggle-dark-mode">
              {{ themeService.theme() === 'light' ? 'Enable' : 'Disable' }}
            </button>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold font-heading text-sm mb-4">Manage Children</h3>
          <div class="space-y-3">
            @for (kid of auth.kids(); track kid.id) {
              <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: var(--muted)">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background-color: var(--color-primary)">{{ kid.name[0] }}</span>
                  <div>
                    <p class="text-sm font-medium">{{ kid.name }}</p>
                    <p class="text-[10px]" style="color: var(--fg-muted)">Age {{ kid.age }} &middot; {{ kid.ui_theme }} theme</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </app-parent-layout>
  `
})
export class ParentSettingsPage {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
}
