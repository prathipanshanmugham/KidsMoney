import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Kid } from '../models/interfaces';
import { AVATARS, getLevelForXp, getAvatarColor } from '../constants/app-data';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold font-heading tracking-tight" data-testid="dashboard-heading">Dashboard</h1>
            <p class="text-sm mt-1" style="color: var(--fg-muted)">Overview of your children's finances</p>
          </div>
          <button (click)="showAddKid.set(true)" class="btn-primary text-sm" data-testid="add-kid-btn">+ Add Child</button>
        </div>

        @if (auth.kids().length === 0 && !loading()) {
          <div class="card p-12 text-center">
            <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent)">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke-width="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-width="2"/></svg>
            </div>
            <h2 class="text-lg font-bold font-heading mb-2">Add Your First Child</h2>
            <p class="text-sm mb-6" style="color: var(--fg-muted)">Get started by adding a child to manage their virtual finances.</p>
            <button (click)="showAddKid.set(true)" class="btn-primary">Add Child</button>
          </div>
        }

        @if (auth.kids().length > 0) {
          <!-- Kid Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            @for (kid of auth.kids(); track kid.id) {
              <div class="card p-6 cursor-pointer transition-all hover:scale-[1.02]"
                   (click)="auth.selectedKid.set(kid)"
                   [style.border-color]="auth.selectedKid()?.id === kid.id ? getAvatarColor(kid.avatar) : ''"
                   [attr.data-testid]="'kid-card-' + kid.name">
                <div class="flex items-center gap-3 mb-4">
                  <span class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold"
                        [style.background-color]="getAvatarColor(kid.avatar)">{{ kid.name[0] }}</span>
                  <div>
                    <h3 class="font-semibold font-heading">{{ kid.name }}</h3>
                    <p class="text-xs" style="color: var(--fg-muted)">Level {{ kid.level }} &middot; {{ getLevelName(kid.xp) }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span style="color: var(--fg-muted)">Balance</span>
                  <span class="font-bold">{{ wallets()[kid.id]?.balance || 0 }} coins</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-1">
                  <span style="color: var(--fg-muted)">Credit Score</span>
                  <span class="font-bold" [style.color]="kid.credit_score >= 700 ? '#34D399' : kid.credit_score >= 400 ? '#FCD34D' : '#F87171'">{{ kid.credit_score }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Selected Kid Stats -->
          @if (selectedDashboard(); as dash) {
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="card p-4">
                <p class="text-xs" style="color: var(--fg-muted)">Balance</p>
                <p class="text-xl font-bold font-heading">{{ dash.wallet.balance }}</p>
              </div>
              <div class="card p-4">
                <p class="text-xs" style="color: var(--fg-muted)">Total Earned</p>
                <p class="text-xl font-bold font-heading text-secondary">{{ dash.wallet.total_earned }}</p>
              </div>
              <div class="card p-4">
                <p class="text-xs" style="color: var(--fg-muted)">Total Saved</p>
                <p class="text-xl font-bold font-heading text-primary">{{ dash.wallet.total_saved }}</p>
              </div>
              <div class="card p-4">
                <p class="text-xs" style="color: var(--fg-muted)">Credit Score</p>
                <p class="text-xl font-bold font-heading">{{ dash.kid?.credit_score || 500 }}</p>
              </div>
            </div>

            <!-- Pending Tasks -->
            @if (dash.active_tasks.length > 0) {
              <div class="card p-6 mb-4">
                <h3 class="text-sm font-semibold font-heading mb-4">Pending Tasks ({{ dash.active_tasks.length }})</h3>
                <div class="space-y-3">
                  @for (task of dash.active_tasks.slice(0, 5); track task.id) {
                    <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: var(--muted)">
                      <div>
                        <p class="text-sm font-medium">{{ task.title }}</p>
                        <p class="text-xs" style="color: var(--fg-muted)">{{ task.reward_amount }} coins</p>
                      </div>
                      @if (task.status === 'completed') {
                        <div class="flex gap-2">
                          <button (click)="approveTask(task.id)" class="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-medium" [attr.data-testid]="'approve-task-' + task.id">Approve</button>
                          <button (click)="rejectTask(task.id)" class="text-xs px-3 py-1.5 rounded-full bg-red-500 text-white font-medium" [attr.data-testid]="'reject-task-' + task.id">Reject</button>
                        </div>
                      } @else {
                        <span class="badge text-xs" style="background-color: color-mix(in srgb, #FCD34D 15%, transparent); color: #FCD34D">Pending</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Recent Transactions -->
            @if (dash.recent_transactions.length > 0) {
              <div class="card p-6">
                <h3 class="text-sm font-semibold font-heading mb-4">Recent Transactions</h3>
                <div class="space-y-3">
                  @for (txn of dash.recent_transactions.slice(0, 5); track txn.id) {
                    <div class="flex items-center justify-between">
                      <p class="text-sm">{{ txn.description }}</p>
                      <span class="text-sm font-bold" [style.color]="txn.type === 'credit' ? '#34D399' : '#F87171'">
                        {{ txn.type === 'credit' ? '+' : '-' }}{{ txn.amount }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          }
        }

        <!-- Add Kid Modal -->
        @if (showAddKid()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showAddKid.set(false)">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="card p-8 w-full max-w-md relative z-10 max-h-[90vh] overflow-y-auto animate-fade-in" (click)="$event.stopPropagation()">
              <h2 class="text-lg font-bold font-heading mb-6" data-testid="add-kid-modal-title">Add Child</h2>
              <form (ngSubmit)="handleAddKid()" class="space-y-4">
                <div>
                  <label class="label">Name</label>
                  <input class="input" placeholder="Child's name" [(ngModel)]="kidForm.name" name="name" data-testid="kid-name-input">
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="label">Age</label>
                    <input class="input" type="number" min="3" max="18" placeholder="Age" [(ngModel)]="kidForm.age" name="age" data-testid="kid-age-input">
                  </div>
                  <div>
                    <label class="label">Grade</label>
                    <input class="input" placeholder="Optional" [(ngModel)]="kidForm.grade" name="grade" data-testid="kid-grade-input">
                  </div>
                </div>
                <div>
                  <label class="label">Avatar</label>
                  <div class="grid grid-cols-4 gap-3">
                    @for (av of avatars; track av.id) {
                      <button type="button" (click)="kidForm.avatar = av.id"
                              [class]="kidForm.avatar === av.id ? 'ring-2 ring-offset-2 scale-110 ring-primary' : ''"
                              class="aspect-square rounded-2xl flex items-center justify-center transition-all"
                              [style.background-color]="kidForm.avatar === av.id ? av.color + '20' : 'var(--muted)'"
                              [attr.data-testid]="'avatar-' + av.id">
                        <span class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" [style.background-color]="av.color">{{ av.id[0].toUpperCase() }}</span>
                      </button>
                    }
                  </div>
                </div>
                <div>
                  <label class="label">UI Theme</label>
                  <div class="grid grid-cols-3 gap-3">
                    @for (th of themeOptions; track th.value) {
                      <button type="button" (click)="kidForm.ui_theme = th.value"
                              class="rounded-2xl p-3 text-center transition-all border-2"
                              [style.border-color]="kidForm.ui_theme === th.value ? th.color : 'transparent'"
                              [style.background-color]="kidForm.ui_theme === th.value ? th.color + '10' : 'var(--muted)'"
                              [attr.data-testid]="'theme-' + th.value">
                        <div class="w-6 h-6 rounded-full mx-auto mb-1.5" [style.background-color]="th.color"></div>
                        <p class="text-xs font-semibold">{{ th.label }}</p>
                        <p class="text-[10px]" style="color: var(--fg-muted)">{{ th.desc }}</p>
                      </button>
                    }
                  </div>
                </div>
                <div>
                  <label class="label">Kid Login PIN</label>
                  <input class="input text-center tracking-[0.3em]" type="text" maxlength="6" placeholder="Set a 4-6 digit PIN" [(ngModel)]="kidForm.pin" name="pin" data-testid="kid-pin-input">
                  <p class="text-[11px] mt-1" style="color: var(--fg-muted)">Your child will use this PIN to log into their own dashboard</p>
                </div>
                <div>
                  <label class="label">Starting Balance (coins)</label>
                  <input class="input" type="number" min="0" placeholder="0" [(ngModel)]="kidForm.starting_balance" name="starting_balance" data-testid="kid-balance-input">
                </div>
                <button type="submit" class="btn-primary w-full py-3" [disabled]="addingKid()" data-testid="submit-add-kid-btn">
                  {{ addingKid() ? 'Adding...' : 'Add Child' }}
                </button>
              </form>
            </div>
          </div>
        }
      </div>
    </app-parent-layout>
  `
})
export class ParentDashboardPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);

  loading = signal(false);
  showAddKid = signal(false);
  addingKid = signal(false);
  wallets = signal<Record<string, any>>({});
  selectedDashboard = signal<any>(null);
  avatars = AVATARS;
  getAvatarColor = getAvatarColor;

  themeOptions = [
    { value: 'boy', label: 'Adventure', color: '#0EA5E9', desc: 'Blue & Teal' },
    { value: 'girl', label: 'Fantasy', color: '#A78BFA', desc: 'Purple & Pink' },
    { value: 'neutral', label: 'Nature', color: '#34D399', desc: 'Green & Blue' },
  ];

  kidForm = { name: '', age: 8, grade: '', avatar: 'panda', ui_theme: 'neutral', pin: '', starting_balance: 0 };

  async ngOnInit() {
    this.loading.set(true);
    await this.loadData();
    this.loading.set(false);
  }

  async loadData() {
    const kids = this.auth.kids();
    const w: Record<string, any> = {};
    for (const kid of kids) {
      w[kid.id] = await this.fs.getWallet(kid.id);
    }
    this.wallets.set(w);
    const selected = this.auth.selectedKid();
    if (selected) {
      this.selectedDashboard.set(await this.fs.getKidDashboard(selected.id));
    }
  }

  getLevelName(xp: number) {
    return getLevelForXp(xp).name;
  }

  async handleAddKid() {
    if (!this.kidForm.name || !this.kidForm.age) return;
    this.addingKid.set(true);
    try {
      const user = this.auth.firebaseUser();
      if (!user) return;
      await this.fs.addKid(user.uid, {
        name: this.kidForm.name, age: this.kidForm.age, grade: this.kidForm.grade,
        avatar: this.kidForm.avatar, ui_theme: this.kidForm.ui_theme, pin: this.kidForm.pin,
        starting_balance: this.kidForm.starting_balance
      } as any);
      await this.auth.loadKids();
      await this.loadData();
      this.showAddKid.set(false);
      this.kidForm = { name: '', age: 8, grade: '', avatar: 'panda', ui_theme: 'neutral', pin: '', starting_balance: 0 };
    } catch (err: any) {
      console.error('Failed to add kid:', err);
    } finally { this.addingKid.set(false); }
  }

  async approveTask(taskId: string) {
    await this.fs.approveTask(taskId);
    await this.loadData();
  }

  async rejectTask(taskId: string) {
    await this.fs.rejectTask(taskId);
    await this.loadData();
  }
}
