import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Task } from '../models/interfaces';
import { KID_THEMES } from '../constants/app-data';

@Component({
  selector: 'app-kid-tasks',
  standalone: true,
  imports: [CommonModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-tasks-heading">My Tasks</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Complete tasks to earn coins!</p>

        @if (tasks().length === 0) {
          <div class="card p-12 text-center"><p class="text-sm" style="color: var(--fg-muted)">No tasks assigned yet. Ask your parent to create some!</p></div>
        }

        <div class="space-y-3">
          @for (task of tasks(); track task.id) {
            <div class="card p-5" [attr.data-testid]="'kid-task-' + task.id">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-sm">{{ task.title }}</p>
                  <p class="text-xs mt-1" style="color: var(--fg-muted)">{{ task.description || 'Complete this task' }}</p>
                  <p class="text-xs mt-1 font-bold" [style.color]="theme().primary">+{{ task.reward_amount }} coins</p>
                </div>
                <div>
                  @if (task.status === 'pending') {
                    <button (click)="completeTask(task.id)" class="text-xs px-4 py-2 rounded-full text-white font-medium" [style.background-color]="theme().primary" [attr.data-testid]="'complete-task-' + task.id">Done!</button>
                  } @else if (task.status === 'completed') {
                    <span class="badge text-[10px]" style="background-color: #4F7DF320; color: #4F7DF3">Waiting Approval</span>
                  } @else if (task.status === 'approved') {
                    <span class="badge text-[10px]" style="background-color: #34D39920; color: #34D399">Approved</span>
                  } @else {
                    <span class="badge text-[10px]" style="background-color: #F8717120; color: #F87171">Rejected</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </app-kid-layout>
  `
})
export class KidTasksPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  tasks = signal<Task[]>([]);
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) this.tasks.set(await this.fs.getTasks(kid.id));
  }

  async completeTask(id: string) {
    const kid = this.auth.kidSession()?.kid;
    if (!kid) return;
    await this.fs.completeTask(id, kid.id);
    this.tasks.set(await this.fs.getTasks(kid.id));
  }
}
