import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { KID_THEMES, getLevelForXp, getNextLevel } from '../constants/app-data';

@Component({
  selector: 'app-kid-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        @if (dashboard(); as d) {
          <!-- Level & XP -->
          <div class="card p-6 mb-6" [style.border-color]="theme().primary + '30'">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-xs" style="color: var(--fg-muted)">Level {{ d.level_info.level }}</p>
                <h2 class="text-xl font-bold font-heading">{{ d.level_info.name }}</h2>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold font-heading" [style.color]="theme().primary">{{ d.wallet?.balance || 0 }}</p>
                <p class="text-[10px]" style="color: var(--fg-muted)">coins</p>
              </div>
            </div>
            @if (d.next_level) {
              <div class="w-full rounded-full h-2 mb-1" style="background-color: var(--muted)">
                <div class="h-2 rounded-full transition-all" [style.width.%]="xpProgress()" [style.background-color]="theme().primary"></div>
              </div>
              <p class="text-[10px]" style="color: var(--fg-muted)">{{ d.kid?.xp || 0 }} / {{ d.next_level.xp_required }} XP to Level {{ d.next_level.level }}</p>
            }
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading" [style.color]="theme().primary">{{ d.stats.total_tasks_completed }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Tasks Done</p></div>
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading" [style.color]="theme().secondary">{{ d.wallet?.total_earned || 0 }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Total Earned</p></div>
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading text-primary">{{ d.wallet?.total_saved || 0 }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Total Saved</p></div>
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading" [style.color]="creditColor()">{{ d.kid?.credit_score || 500 }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Credit Score</p></div>
          </div>

          <!-- Active Tasks -->
          @if (d.active_tasks.length > 0) {
            <div class="card p-5 mb-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold font-heading">My Tasks</h3>
                <a routerLink="/kid/tasks" class="text-xs font-medium" [style.color]="theme().primary">View All</a>
              </div>
              @for (task of d.active_tasks.slice(0, 3); track task.id) {
                <div class="flex items-center justify-between p-3 rounded-xl mb-2" style="background-color: var(--muted)">
                  <div>
                    <p class="text-sm font-medium">{{ task.title }}</p>
                    <p class="text-xs" [style.color]="theme().primary">+{{ task.reward_amount }} coins</p>
                  </div>
                  <span class="badge text-[10px]" [style.background-color]="theme().primary + '15'" [style.color]="theme().primary">{{ task.status }}</span>
                </div>
              }
            </div>
          }

          <!-- Recent Transactions -->
          @if (d.recent_transactions.length > 0) {
            <div class="card p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold font-heading">Recent Activity</h3>
                <a routerLink="/kid/wallet" class="text-xs font-medium" [style.color]="theme().primary">View All</a>
              </div>
              @for (txn of d.recent_transactions.slice(0, 5); track txn.id) {
                <div class="flex items-center justify-between py-2">
                  <p class="text-xs">{{ txn.description }}</p>
                  <span class="text-xs font-bold" [style.color]="txn.type === 'credit' ? '#34D399' : '#F87171'">{{ txn.type === 'credit' ? '+' : '-' }}{{ txn.amount }}</span>
                </div>
              }
            </div>
          }
        } @else {
          <div class="flex items-center justify-center h-64">
            <div class="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" [style.border-color]="theme().primary"></div>
          </div>
        }
      </div>
    </app-kid-layout>
  `
})
export class KidHomePage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  dashboard = signal<any>(null);

  theme = computed(() => {
    const t = this.auth.kidSession()?.kid?.ui_theme || 'neutral';
    return KID_THEMES[t] || KID_THEMES['neutral'];
  });

  xpProgress = computed(() => {
    const d = this.dashboard();
    if (!d?.next_level || !d?.kid) return 100;
    const currentLevelXp = d.level_info.xp_required;
    const nextLevelXp = d.next_level.xp_required;
    return ((d.kid.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  });

  creditColor = computed(() => {
    const score = this.dashboard()?.kid?.credit_score || 500;
    return score >= 700 ? '#34D399' : score >= 400 ? '#FCD34D' : '#F87171';
  });

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) this.dashboard.set(await this.fs.getKidDashboard(kid.id));
  }
}
