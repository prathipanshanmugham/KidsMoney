import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background-color: var(--bg)">
      <div class="w-full max-w-md">
        <a routerLink="/" class="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style="color: var(--fg-muted)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" stroke-width="2"/></svg>
          Back to home
        </a>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold font-heading tracking-tight">Create Account</h1>
            <p class="text-sm" style="color: var(--fg-muted)">Start your family's financial journey</p>
          </div>
        </div>
        <div class="card p-8">
          <form (ngSubmit)="handleSignup()" class="space-y-5">
            <div>
              <label class="label">Full Name</label>
              <input class="input" type="text" placeholder="Your name" [(ngModel)]="fullName" name="fullName" data-testid="signup-name-input">
            </div>
            <div>
              <label class="label">Email</label>
              <input class="input" type="email" placeholder="parent&#64;example.com" [(ngModel)]="email" name="email" data-testid="signup-email-input">
            </div>
            <div>
              <label class="label">Password</label>
              <input class="input" type="password" placeholder="Min 6 characters" [(ngModel)]="password" name="password" data-testid="signup-password-input">
            </div>
            @if (error()) { <p class="text-red-500 text-sm">{{ error() }}</p> }
            <button type="submit" class="btn-primary w-full py-3" [disabled]="loading()" data-testid="signup-submit-btn">
              {{ loading() ? 'Creating...' : 'Create Account' }}
            </button>
          </form>
          <p class="text-center text-sm mt-6" style="color: var(--fg-muted)">
            Already have an account? <a routerLink="/login" class="font-medium text-primary" data-testid="signup-to-login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class SignupPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  fullName = ''; email = ''; password = '';
  loading = signal(false); error = signal('');

  async handleSignup() {
    if (!this.fullName || !this.email || !this.password) { this.error.set('Please fill in all fields'); return; }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    this.loading.set(true); this.error.set('');
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Please check your Firebase configuration.')), 15000));
      await Promise.race([this.auth.signup(this.fullName, this.email, this.password), timeoutPromise]);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      const msg = err?.code === 'auth/configuration-not-found'
        ? 'Firebase Auth not configured. Please enable Email/Password sign-in in Firebase Console.'
        : err?.message || 'Signup failed';
      this.error.set(msg);
    } finally { this.loading.set(false); }
  }
}
