import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background-color: var(--bg)">
      <div class="w-full max-w-md">
        <a routerLink="/" class="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style="color: var(--fg-muted)" data-testid="login-back-btn">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" stroke-width="2"/></svg>
          Back to home
        </a>

        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold font-heading tracking-tight">Welcome Back</h1>
            <p class="text-sm" style="color: var(--fg-muted)">Sign in to Kids Money</p>
          </div>
        </div>

        <div class="card p-8">
          <!-- Tabs -->
          <div class="flex rounded-full p-1 mb-6" style="background-color: var(--muted)" data-testid="login-tabs">
            <button (click)="tab.set('parent')" [class]="tab() === 'parent' ? 'tab-active' : 'tab-inactive'" data-testid="login-tab-parent">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke-width="2"/></svg>
              Parent
            </button>
            <button (click)="tab.set('kid')" [class]="tab() === 'kid' ? 'tab-active' : 'tab-inactive'" data-testid="login-tab-kid">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-width="2"/></svg>
              Kid
            </button>
          </div>

          <!-- Parent Login -->
          @if (tab() === 'parent') {
            <form (ngSubmit)="handleParentLogin()" class="space-y-5">
              <div>
                <label class="label">Email</label>
                <input class="input" type="email" placeholder="parent&#64;example.com" [(ngModel)]="email" name="email" data-testid="login-email-input">
              </div>
              <div>
                <label class="label">Password</label>
                <input class="input" [type]="showPass() ? 'text' : 'password'" placeholder="Enter your password" [(ngModel)]="password" name="password" data-testid="login-password-input">
              </div>
              @if (error()) { <p class="text-red-500 text-sm">{{ error() }}</p> }
              <button type="submit" class="btn-primary w-full py-3" [disabled]="loading()" data-testid="login-submit-btn">
                {{ loading() ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>
            <p class="text-center text-sm mt-6" style="color: var(--fg-muted)">
              Don't have an account? <a routerLink="/signup" class="font-medium text-primary" data-testid="login-to-signup">Sign up</a>
            </p>
          }

          <!-- Kid Login -->
          @if (tab() === 'kid') {
            <form (ngSubmit)="handleKidLogin()" class="space-y-5">
              <div>
                <label class="label">Parent's Email</label>
                <input class="input" type="email" placeholder="parent&#64;example.com" [(ngModel)]="parentEmail" name="parentEmail" data-testid="kid-login-parent-email">
              </div>
              <div>
                <label class="label">Your Name</label>
                <input class="input" type="text" placeholder="What's your name?" [(ngModel)]="kidName" name="kidName" data-testid="kid-login-name">
              </div>
              <div>
                <label class="label">Your PIN</label>
                <input class="input text-center tracking-[0.5em] text-lg" type="password" placeholder="Enter your secret PIN" [(ngModel)]="kidPin" name="kidPin" maxlength="6" data-testid="kid-login-pin">
              </div>
              @if (error()) { <p class="text-red-500 text-sm">{{ error() }}</p> }
              <button type="submit" class="btn-primary w-full py-3" [disabled]="loading()" data-testid="kid-login-submit-btn">
                {{ loading() ? 'Signing in...' : "Let's Go!" }}
              </button>
            </form>
            <p class="text-center text-sm mt-6" style="color: var(--fg-muted)">Ask your parent to create your account and set your PIN</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tab-active { flex: 1; padding: 0.5rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background-color: var(--bg-card); color: var(--fg); cursor: pointer; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .tab-inactive { flex: 1; padding: 0.5rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: transparent; color: var(--fg-muted); cursor: pointer; border: none; }
  `]
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  tab = signal<'parent' | 'kid'>('parent');
  email = ''; password = ''; showPass = signal(false);
  parentEmail = ''; kidName = ''; kidPin = '';
  loading = signal(false); error = signal('');

  async handleParentLogin() {
    if (!this.email || !this.password) { this.error.set('Please fill in all fields'); return; }
    this.loading.set(true); this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Login failed');
    } finally { this.loading.set(false); }
  }

  async handleKidLogin() {
    if (!this.parentEmail || !this.kidName || !this.kidPin) { this.error.set('Please fill in all fields'); return; }
    this.loading.set(true); this.error.set('');
    try {
      await this.auth.kidLogin(this.parentEmail, this.kidName, this.kidPin);
      this.router.navigate(['/kid/dashboard']);
    } catch (err: any) {
      this.error.set(err.message || 'Login failed');
    } finally { this.loading.set(false); }
  }
}
