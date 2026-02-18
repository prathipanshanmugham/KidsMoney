import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { KID_THEMES, getLevelForXp, LEVELS } from '../constants/app-data';

@Component({
  selector: 'app-kid-achievements',
  standalone: true,
  imports: [CommonModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-achievements-heading">Achievements</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Your badges and progress</p>

        @if (data(); as d) {
          <!-- Level Progress -->
          <div class="card p-6 mb-6" [style.border-color]="theme().primary + '30'">
            <h3 class="text-sm font-semibold font-heading mb-4">Level Progress</h3>
            <div class="grid grid-cols-5 gap-2">
              @for (level of levels; track level.level) {
                <div class="text-center p-2 rounded-xl transition-all"
                     [style.background-color]="d.level_info.level >= level.level ? theme().primary + '15' : 'var(--muted)'"
                     [style.opacity]="d.level_info.level >= level.level ? '1' : '0.5'">
                  <p class="text-lg font-bold" [style.color]="d.level_info.level >= level.level ? theme().primary : 'var(--fg-muted)'">{{ level.level }}</p>
                  <p class="text-[8px] truncate" style="color: var(--fg-muted)">{{ level.name }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading" [style.color]="theme().primary">{{ d.xp }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Total XP</p></div>
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading" [style.color]="creditColor(d.credit_score)">{{ d.credit_score }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Credit Score</p></div>
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading">{{ d.stats.tasks_completed }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Tasks Done</p></div>
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading">{{ d.stats.stories_read }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Stories Read</p></div>
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading">{{ d.stats.goals_achieved }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Goals Done</p></div>
            <div class="card p-4 text-center"><p class="text-xl font-bold font-heading">{{ d.stats.sip_payments }}</p><p class="text-[10px]" style="color: var(--fg-muted)">SIP Payments</p></div>
          </div>

          <!-- Badges -->
          <div class="card p-6">
            <h3 class="text-sm font-semibold font-heading mb-4">Badges Earned ({{ d.badges.length }})</h3>
            @if (d.badges.length === 0) {
              <p class="text-sm text-center py-6" style="color: var(--fg-muted)">Complete tasks, read stories, and save to earn badges!</p>
            }
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              @for (badge of d.badges; track badge.name) {
                <div class="text-center p-4 rounded-2xl" [style.background-color]="theme().primary + '10'">
                  <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" [style.background-color]="theme().primary + '20'">
                    <svg class="w-6 h-6" [style.color]="theme().primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" stroke-width="2"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke-width="2"/></svg>
                  </div>
                  <p class="text-xs font-bold">{{ badge.name }}</p>
                  <p class="text-[10px]" style="color: var(--fg-muted)">{{ badge.desc }}</p>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="flex items-center justify-center h-64">
            <div class="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" [style.border-color]="theme().primary"></div>
          </div>
        }
      </div>
    </app-kid-layout>
  `
})
export class KidAchievementsPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  data = signal<any>(null);
  levels = LEVELS;
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) this.data.set(await this.fs.getKidAchievements(kid.id));
  }

  creditColor(score: number) { return score >= 700 ? '#34D399' : score >= 400 ? '#FCD34D' : '#F87171'; }
}
