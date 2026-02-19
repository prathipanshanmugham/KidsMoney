import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen mesh-gradient">
      <!-- Nav -->
      <header class="fixed top-0 left-0 right-0 z-50 glass" data-testid="landing-nav">
        <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #0D9488, #14B8A6)">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
            </div>
            <span class="text-base font-bold font-heading tracking-tight">Kids Money</span>
          </a>
          <nav class="flex items-center gap-2">
            <a routerLink="/login" class="text-sm font-medium px-5 py-2 rounded-full transition-colors" style="color: var(--fg-secondary)" data-testid="landing-login-btn">Sign In</a>
            <a routerLink="/signup" class="btn-teal !py-2.5 !px-6 !text-sm" data-testid="landing-signup-btn">Get Started</a>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section class="pt-32 lg:pt-44 pb-20 lg:pb-32 px-6">
        <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div class="animate-fade-up">
            <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold font-heading tracking-wide"
                 style="background: rgba(13,148,136,0.08); color: #0D9488" data-testid="hero-badge">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              Financial Literacy for Kids
            </div>
            <h1 class="text-5xl lg:text-[4.25rem] font-extrabold font-heading tracking-tight leading-[1.08] mb-6" style="color: var(--fg)">
              Money skills<br>
              <span style="background: linear-gradient(135deg, #0D9488, #14B8A6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">they'll keep<br>forever.</span>
            </h1>
            <p class="text-lg lg:text-xl leading-relaxed mb-10 max-w-md" style="color: var(--fg-secondary)">
              A gamified platform where kids earn, save, invest, and learn about finance — all with virtual money, managed by you.
            </p>
            <div class="flex flex-wrap items-center gap-4">
              <a routerLink="/signup" class="btn-teal !px-10 !py-4 !text-base" data-testid="hero-cta">Start Free</a>
              <a routerLink="/login" class="btn-ghost !px-8 !py-4 !text-base">Sign In</a>
            </div>
            <div class="flex items-center gap-6 mt-10">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white" style="border-color: var(--canvas); background: #3B82F6">A</div>
                <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white" style="border-color: var(--canvas); background: #EC4899">S</div>
                <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white" style="border-color: var(--canvas); background: #10B981">M</div>
              </div>
              <p class="text-xs" style="color: var(--fg-secondary)"><span class="font-semibold" style="color: var(--fg)">2,400+</span> families learning together</p>
            </div>
          </div>

          <!-- Hero Visual -->
          <div class="hidden lg:block animate-fade-up stagger-2">
            <div class="relative">
              <!-- Phone mockup -->
              <div class="card-widget p-6 rounded-3xl max-w-xs mx-auto relative z-10">
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style="background: linear-gradient(135deg, #3B82F6, #06B6D4)">S</div>
                  <div>
                    <p class="text-sm font-bold font-heading">Sarah's Dashboard</p>
                    <p class="text-xs" style="color: var(--fg-secondary)">Level 5 &middot; Budget Hero</p>
                  </div>
                </div>
                <div class="rounded-2xl p-5 mb-4" style="background: linear-gradient(135deg, #0D9488, #14B8A6)">
                  <p class="text-xs text-white/70 font-medium">Total Balance</p>
                  <p class="text-3xl font-extrabold text-white font-heading mt-1">2,450</p>
                  <p class="text-xs text-white/60 mt-1">coins</p>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: rgba(16,185,129,0.1)"><svg class="w-4 h-4" style="color: #10B981" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/></svg></div>
                      <span class="text-xs font-medium">Task reward</span>
                    </div>
                    <span class="text-xs font-bold" style="color: #10B981">+25</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl flex items-center justify-center" style="background: rgba(59,130,246,0.1)"><svg class="w-4 h-4" style="color: #3B82F6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/></svg></div>
                      <span class="text-xs font-medium">Goal savings</span>
                    </div>
                    <span class="text-xs font-bold" style="color: #3B82F6">-50</span>
                  </div>
                </div>
              </div>
              <!-- Floating elements -->
              <div class="absolute -top-4 -right-4 card-widget px-4 py-2.5 rounded-2xl z-20 animate-fade-up stagger-3">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: rgba(250,204,21,0.15)"><svg class="w-3.5 h-3.5" style="color: #FACC15" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg></div>
                  <span class="text-xs font-bold font-heading">Level Up!</span>
                </div>
              </div>
              <div class="absolute -bottom-3 -left-6 card-widget px-4 py-3 rounded-2xl z-20 animate-fade-up stagger-4">
                <p class="text-[10px] font-medium" style="color: var(--fg-secondary)">Credit Score</p>
                <p class="text-lg font-extrabold font-heading" style="color: #10B981">750</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Bento Grid -->
      <section class="px-6 pb-24 lg:pb-36">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16 animate-fade-up">
            <p class="text-xs font-semibold font-heading uppercase tracking-widest mb-3" style="color: #0D9488">Everything they need</p>
            <h2 class="text-3xl lg:text-4xl font-bold font-heading tracking-tight">Real-world skills,<br>zero-risk playground.</h2>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            @for (f of features; track f.title; let i = $index) {
              <div class="card-widget card-widget-glow p-6 lg:p-8 animate-fade-up"
                   [class]="i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''"
                   [style.animation-delay.ms]="i * 80"
                   [attr.data-testid]="'feature-' + f.key">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                     [style.background]="f.bgColor">
                  <svg [attr.class]="'w-5 h-5'" [style.color]="f.iconColor" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    @if (f.key === 'tasks') { <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/> }
                    @if (f.key === 'saving') { <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/> }
                    @if (f.key === 'investing') { <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/> }
                    @if (f.key === 'stories') { <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/> }
                    @if (f.key === 'credit') { <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/> }
                    @if (f.key === 'levels') { <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/> }
                  </svg>
                </div>
                <h3 class="font-bold font-heading text-sm lg:text-base mb-1.5 tracking-tight">{{ f.title }}</h3>
                <p class="text-xs lg:text-sm leading-relaxed" style="color: var(--fg-secondary)">{{ f.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="px-6 pb-24 lg:pb-36">
        <div class="max-w-3xl mx-auto text-center">
          <div class="card-widget p-10 lg:p-16 rounded-[2rem]" style="background: linear-gradient(135deg, #0D9488, #0F766E)">
            <h2 class="text-2xl lg:text-4xl font-bold font-heading tracking-tight text-white mb-4">Start your family's<br>financial journey today.</h2>
            <p class="text-sm lg:text-base text-white/70 mb-8 max-w-md mx-auto">No real money. No risk. Just fun, rewarding lessons your kids will thank you for.</p>
            <a routerLink="/signup" class="inline-flex items-center gap-2 px-10 py-4 bg-white rounded-full font-bold font-heading text-teal-700 hover:scale-105 transition-transform shadow-lg" data-testid="cta-signup">
              Get Started Free
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="px-6 pb-10">
        <div class="max-w-6xl mx-auto flex items-center justify-between pt-8 border-t" style="border-color: var(--border)">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #0D9488, #14B8A6)">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/></svg>
            </div>
            <span class="text-xs font-semibold font-heading">Kids Money</span>
          </div>
          <p class="text-xs" style="color: var(--fg-secondary)">Built with love for families.</p>
        </div>
      </footer>
    </div>
  `
})
export class LandingPage {
  features = [
    { key: 'tasks', title: 'Tasks & Rewards', desc: 'Create chores, set rewards. Kids complete them, earn virtual coins, and build discipline.', iconColor: '#0D9488', bgColor: 'rgba(13,148,136,0.08)' },
    { key: 'saving', title: 'Smart Goals', desc: 'Set savings targets and watch progress grow.', iconColor: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)' },
    { key: 'investing', title: 'SIP Investing', desc: 'Learn compound interest through regular investments.', iconColor: '#A855F7', bgColor: 'rgba(168,85,247,0.08)' },
    { key: 'stories', title: 'Fun Stories', desc: 'Interactive financial lessons with quizzes.', iconColor: '#F97316', bgColor: 'rgba(249,115,22,0.08)' },
    { key: 'credit', title: 'Credit Score', desc: 'Gamified scoring that rewards responsibility.', iconColor: '#EC4899', bgColor: 'rgba(236,72,153,0.08)' },
    { key: 'levels', title: '10 Levels', desc: 'From Money Beginner to Money Legend.', iconColor: '#FACC15', bgColor: 'rgba(250,204,21,0.1)' },
  ];
}
