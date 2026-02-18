import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Goal } from '../models/interfaces';
import { KID_THEMES } from '../constants/app-data';

@Component({
  selector: 'app-kid-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-goals-heading">My Goals</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Save towards your dreams!</p>

        @if (goals().length === 0) {
          <div class="card p-12 text-center"><p class="text-sm" style="color: var(--fg-muted)">No goals yet. Ask your parent to set one up!</p></div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (goal of goals(); track goal.id) {
            <div class="card p-6" [attr.data-testid]="'kid-goal-' + goal.id">
              <h3 class="font-semibold font-heading mb-3">{{ goal.title }}</h3>
              <div class="w-full rounded-full h-3 mb-2" style="background-color: var(--muted)">
                <div class="h-3 rounded-full transition-all" [style.width.%]="(goal.saved_amount / goal.target_amount) * 100" [style.background-color]="theme().primary"></div>
              </div>
              <p class="text-xs mb-3" style="color: var(--fg-muted)">{{ goal.saved_amount }} / {{ goal.target_amount }} coins</p>
              @if (goal.status === 'active') {
                <div class="flex gap-2">
                  <input class="input flex-1" type="number" min="1" placeholder="Amount" [(ngModel)]="amounts[goal.id]" [attr.data-testid]="'kid-contribute-input-' + goal.id">
                  <button (click)="contribute(goal.id)" class="text-xs px-4 py-2 rounded-full text-white font-medium" [style.background-color]="theme().primary" [attr.data-testid]="'kid-contribute-btn-' + goal.id">Save</button>
                </div>
              } @else {
                <span class="badge text-[10px]" style="background-color: #34D39920; color: #34D399">Completed!</span>
              }
            </div>
          }
        </div>
      </div>
    </app-kid-layout>
  `
})
export class KidGoalsPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  goals = signal<Goal[]>([]);
  amounts: Record<string, number> = {};
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) this.goals.set(await this.fs.getGoals(kid.id));
  }

  async contribute(goalId: string) {
    const amount = this.amounts[goalId];
    if (!amount || amount <= 0) return;
    const kid = this.auth.kidSession()?.kid;
    if (!kid) return;
    try { await this.fs.contributeToGoal(goalId, kid.id, amount); this.amounts[goalId] = 0; this.goals.set(await this.fs.getGoals(kid.id)); } catch (e: any) { alert(e.message); }
  }
}
