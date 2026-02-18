import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen" style="background-color: var(--bg)">
      <header class="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" stroke-width="2"/><path d="M2 10h20" stroke-width="2"/></svg>
          </div>
          <span class="text-lg font-bold font-heading tracking-tight">Kids Money</span>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-80" style="color: var(--fg-muted)" data-testid="landing-login-btn">Sign In</a>
          <a routerLink="/signup" class="btn-primary text-sm" data-testid="landing-signup-btn">Get Started</a>
        </div>
      </header>

      <main class="px-6 max-w-6xl mx-auto pt-20 pb-32">
        <div class="text-center max-w-3xl mx-auto animate-fade-in">
          <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold"
               style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary)">
            Financial Literacy for Kids
          </div>
          <h1 class="text-5xl lg:text-7xl font-bold font-heading tracking-tight leading-[1.1] mb-6">
            Teach Kids <span class="text-primary">Money Skills</span> That Last
          </h1>
          <p class="text-lg lg:text-xl mb-10 max-w-xl mx-auto" style="color: var(--fg-muted)">
            A gamified platform where kids earn, save, invest, and learn about finance - all with virtual money, managed by parents.
          </p>
          <div class="flex items-center justify-center gap-4">
            <a routerLink="/signup" class="btn-primary text-base px-8 py-4" data-testid="hero-cta">Start Free</a>
            <a routerLink="/login" class="text-sm font-medium px-6 py-4 rounded-full border transition-all"
               style="border-color: var(--border); color: var(--fg)">I have an account</a>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24">
          @for (feature of features; track feature.title) {
            <div class="card p-6 text-center">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                   [style.background-color]="feature.color + '15'" [style.color]="feature.color">
                <span [innerHTML]="feature.safeIcon"></span>
              </div>
              <h3 class="font-semibold text-sm mb-1 font-heading">{{ feature.title }}</h3>
              <p class="text-xs" style="color: var(--fg-muted)">{{ feature.desc }}</p>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class LandingPage {
  private sanitizer = inject(DomSanitizer);

  features: { title: string; desc: string; color: string; safeIcon: SafeHtml }[];

  constructor() {
    const raw = [
      { title: 'Tasks & Rewards', desc: 'Earn coins by completing chores', color: '#4F7DF3', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4" stroke-width="2"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke-width="2"/></svg>' },
      { title: 'Smart Saving', desc: 'Set goals and watch savings grow', color: '#34D399', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" stroke-width="2"/></svg>' },
      { title: 'SIP Investing', desc: 'Learn compound interest', color: '#A78BFA', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-width="2"/></svg>' },
      { title: 'Fun Stories', desc: 'Story-based money lessons', color: '#FB923C', icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke-width="2"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke-width="2"/></svg>' },
    ];
    this.features = raw.map(f => ({ ...f, safeIcon: this.sanitizer.bypassSecurityTrustHtml(f.icon) }));
  }
}
