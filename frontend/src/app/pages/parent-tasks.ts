import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Task } from '../models/interfaces';

@Component({
  selector: 'app-parent-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold font-heading tracking-tight" data-testid="tasks-heading">Tasks</h1>
            <p class="text-sm mt-1" style="color: var(--fg-muted)">Manage tasks for {{ auth.selectedKid()?.name || 'your child' }}</p>
          </div>
          <button (click)="showCreate.set(true)" class="btn-primary text-sm" data-testid="create-task-btn">+ New Task</button>
        </div>

        @if (!auth.selectedKid()) {
          <div class="card p-12 text-center">
            <p class="text-sm" style="color: var(--fg-muted)">Please add a child first from the Dashboard.</p>
          </div>
        } @else {
          <!-- Filter tabs -->
          <div class="flex gap-2 mb-6">
            @for (f of filters; track f.value) {
              <button (click)="filter.set(f.value)"
                      [class]="filter() === f.value ? 'btn-primary text-xs px-4 py-2' : 'text-xs px-4 py-2 rounded-full border'"
                      [style.border-color]="filter() !== f.value ? 'var(--border)' : ''"
                      [attr.data-testid]="'filter-' + f.value">
                {{ f.label }}
              </button>
            }
          </div>

          @if (filteredTasks().length === 0) {
            <div class="card p-12 text-center">
              <p class="text-sm" style="color: var(--fg-muted)">No tasks yet. Create one to get started!</p>
            </div>
          }

          <div class="space-y-3">
            @for (task of filteredTasks(); track task.id) {
              <div class="card p-4 flex items-center justify-between" [attr.data-testid]="'task-' + task.id">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold">{{ task.title }}</span>
                    <span class="badge text-[10px]" [style.background-color]="statusColor(task.status) + '15'" [style.color]="statusColor(task.status)">{{ task.status }}</span>
                  </div>
                  <p class="text-xs mt-1" style="color: var(--fg-muted)">{{ task.reward_amount }} coins &middot; {{ task.frequency }}</p>
                </div>
                <div class="flex gap-2">
                  @if (task.status === 'completed') {
                    <button (click)="approve(task.id)" class="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-medium" [attr.data-testid]="'approve-' + task.id">Approve</button>
                    <button (click)="reject(task.id)" class="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white font-medium" [attr.data-testid]="'reject-' + task.id">Reject</button>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Create Task Modal -->
        @if (showCreate()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showCreate.set(false)">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="card p-8 w-full max-w-md relative z-10 animate-fade-in" (click)="$event.stopPropagation()">
              <h2 class="text-lg font-bold font-heading mb-6">Create Task</h2>
              <form (ngSubmit)="createTask()" class="space-y-4">
                <div>
                  <label class="label">Title</label>
                  <input class="input" placeholder="e.g., Clean your room" [(ngModel)]="taskForm.title" name="title" data-testid="task-title-input">
                </div>
                <div>
                  <label class="label">Description</label>
                  <textarea class="input" rows="2" placeholder="Optional details" [(ngModel)]="taskForm.description" name="description"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Reward (coins)</label>
                    <input class="input" type="number" min="1" [(ngModel)]="taskForm.reward_amount" name="reward" data-testid="task-reward-input">
                  </div>
                  <div>
                    <label class="label">Penalty (coins)</label>
                    <input class="input" type="number" min="0" [(ngModel)]="taskForm.penalty_amount" name="penalty">
                  </div>
                </div>
                <div>
                  <label class="label">Frequency</label>
                  <select class="input" [(ngModel)]="taskForm.frequency" name="frequency">
                    <option value="one-time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="approval" [(ngModel)]="taskForm.approval_required" name="approval" class="rounded">
                  <label for="approval" class="text-sm">Requires parent approval</label>
                </div>
                <button type="submit" class="btn-primary w-full py-3" [disabled]="creating()" data-testid="submit-task-btn">
                  {{ creating() ? 'Creating...' : 'Create Task' }}
                </button>
              </form>
            </div>
          </div>
        }
      </div>
    </app-parent-layout>
  `
})
export class ParentTasksPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);

  tasks = signal<Task[]>([]);
  filter = signal('all');
  showCreate = signal(false);
  creating = signal(false);

  filters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Needs Review' },
    { value: 'approved', label: 'Approved' },
  ];

  taskForm = { title: '', description: '', reward_amount: 10, penalty_amount: 0, frequency: 'one-time', approval_required: true };

  filteredTasks = signal<Task[]>([]);

  async ngOnInit() {
    await this.loadTasks();
  }

  async loadTasks() {
    const kid = this.auth.selectedKid();
    if (!kid) return;
    const all = await this.fs.getTasks(kid.id);
    this.tasks.set(all);
    this.updateFiltered();
  }

  updateFiltered() {
    const f = this.filter();
    const all = this.tasks();
    this.filteredTasks.set(f === 'all' ? all : all.filter(t => t.status === f));
  }

  statusColor(status: string) {
    return { pending: '#FCD34D', completed: '#4F7DF3', approved: '#34D399', rejected: '#F87171' }[status] || '#71717A';
  }

  async createTask() {
    if (!this.taskForm.title) return;
    this.creating.set(true);
    try {
      const kid = this.auth.selectedKid();
      const user = this.auth.firebaseUser();
      if (!kid || !user) return;
      await this.fs.createTask(user.uid, kid.id, this.taskForm);
      await this.loadTasks();
      this.showCreate.set(false);
      this.taskForm = { title: '', description: '', reward_amount: 10, penalty_amount: 0, frequency: 'one-time', approval_required: true };
    } finally { this.creating.set(false); }
  }

  async approve(id: string) {
    await this.fs.approveTask(id);
    await this.loadTasks();
  }

  async reject(id: string) {
    await this.fs.rejectTask(id);
    await this.loadTasks();
  }
}
