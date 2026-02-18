import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Goal } from '../models/interfaces';

@Component({
  selector: 'app-parent-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold font-heading tracking-tight" data-testid="goals-heading">Goals</h1>
            <p class="text-sm mt-1" style="color: var(--fg-muted)">Savings goals for {{ auth.selectedKid()?.name }}</p>
          </div>
          <button (click)="showCreate.set(true)" class="btn-primary text-sm" data-testid="create-goal-btn">+ New Goal</button>
        </div>

        @if (goals().length === 0) {
          <div class="card p-12 text-center"><p class="text-sm" style="color: var(--fg-muted)">No goals yet. Create one to start saving!</p></div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (goal of goals(); track goal.id) {
            <div class="card p-6" [attr.data-testid]="'goal-' + goal.id">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold font-heading">{{ goal.title }}</h3>
                <span class="badge text-[10px]" [style.background-color]="goal.status === 'completed' ? '#34D39920' : '#FCD34D20'" [style.color]="goal.status === 'completed' ? '#34D399' : '#FCD34D'">{{ goal.status }}</span>
              </div>
              <div class="w-full rounded-full h-2 mb-2" style="background-color: var(--muted)">
                <div class="h-2 rounded-full bg-primary transition-all" [style.width.%]="(goal.saved_amount / goal.target_amount) * 100"></div>
              </div>
              <p class="text-xs" style="color: var(--fg-muted)">{{ goal.saved_amount }} / {{ goal.target_amount }} coins ({{ ((goal.saved_amount / goal.target_amount) * 100).toFixed(0) }}%)</p>
              @if (goal.status === 'active') {
                <div class="flex gap-2 mt-3">
                  <input class="input flex-1" type="number" min="1" [placeholder]="'Amount'" [(ngModel)]="contributeAmounts[goal.id]" [attr.data-testid]="'contribute-input-' + goal.id">
                  <button (click)="contribute(goal.id)" class="btn-primary text-xs" [attr.data-testid]="'contribute-btn-' + goal.id">Save</button>
                </div>
              }
            </div>
          }
        </div>

        @if (showCreate()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showCreate.set(false)">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="card p-8 w-full max-w-md relative z-10 animate-fade-in" (click)="$event.stopPropagation()">
              <h2 class="text-lg font-bold font-heading mb-6">Create Goal</h2>
              <form (ngSubmit)="createGoal()" class="space-y-4">
                <div><label class="label">Goal Title</label><input class="input" placeholder="e.g., New bicycle" [(ngModel)]="goalForm.title" name="title" data-testid="goal-title-input"></div>
                <div><label class="label">Target Amount (coins)</label><input class="input" type="number" min="1" [(ngModel)]="goalForm.target_amount" name="target" data-testid="goal-target-input"></div>
                <button type="submit" class="btn-primary w-full py-3" [disabled]="creating()" data-testid="submit-goal-btn">{{ creating() ? 'Creating...' : 'Create Goal' }}</button>
              </form>
            </div>
          </div>
        }
      </div>
    </app-parent-layout>
  `
})
export class ParentGoalsPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  goals = signal<Goal[]>([]);
  showCreate = signal(false);
  creating = signal(false);
  goalForm = { title: '', target_amount: 100 };
  contributeAmounts: Record<string, number> = {};

  async ngOnInit() { await this.load(); }

  async load() {
    const kid = this.auth.selectedKid();
    if (!kid) return;
    this.goals.set(await this.fs.getGoals(kid.id));
  }

  async createGoal() {
    if (!this.goalForm.title) return;
    this.creating.set(true);
    try {
      const kid = this.auth.selectedKid();
      const user = this.auth.firebaseUser();
      if (!kid || !user) return;
      await this.fs.createGoal(user.uid, kid.id, this.goalForm);
      await this.load();
      this.showCreate.set(false);
      this.goalForm = { title: '', target_amount: 100 };
    } finally { this.creating.set(false); }
  }

  async contribute(goalId: string) {
    const amount = this.contributeAmounts[goalId];
    if (!amount || amount <= 0) return;
    const kid = this.auth.selectedKid();
    if (!kid) return;
    try {
      await this.fs.contributeToGoal(goalId, kid.id, amount);
      this.contributeAmounts[goalId] = 0;
      await this.load();
    } catch (err: any) { alert(err.message); }
  }
}
