import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Wallet, Transaction } from '../models/interfaces';
import { KID_THEMES } from '../constants/app-data';

@Component({
  selector: 'app-kid-wallet',
  standalone: true,
  imports: [CommonModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-wallet-heading">My Wallet</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Your money at a glance</p>

        @if (wallet()) {
          <div class="card p-8 mb-6 text-center" [style.border-color]="theme().primary + '30'">
            <p class="text-sm" style="color: var(--fg-muted)">Current Balance</p>
            <p class="text-4xl font-bold font-heading mt-1" [style.color]="theme().primary">{{ wallet()!.balance }}</p>
            <p class="text-xs mt-1" style="color: var(--fg-muted)">coins</p>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading text-secondary">{{ wallet()!.total_earned }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Earned</p></div>
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading text-red-400">{{ wallet()!.total_spent }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Spent</p></div>
            <div class="card p-4 text-center"><p class="text-lg font-bold font-heading text-primary">{{ wallet()!.total_saved }}</p><p class="text-[10px]" style="color: var(--fg-muted)">Saved</p></div>
          </div>
        }

        <div class="card p-5">
          <h3 class="text-sm font-semibold font-heading mb-4">Transaction History</h3>
          @if (transactions().length === 0) {
            <p class="text-sm text-center py-8" style="color: var(--fg-muted)">No transactions yet</p>
          }
          @for (txn of transactions(); track txn.id) {
            <div class="flex items-center justify-between py-3 border-b" style="border-color: var(--border)">
              <div><p class="text-sm">{{ txn.description }}</p><p class="text-[10px]" style="color: var(--fg-muted)">{{ txn.created_at | date:'short' }}</p></div>
              <span class="text-sm font-bold" [style.color]="txn.type === 'credit' ? '#34D399' : '#F87171'">{{ txn.type === 'credit' ? '+' : '-' }}{{ txn.amount }}</span>
            </div>
          }
        </div>
      </div>
    </app-kid-layout>
  `
})
export class KidWalletPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  wallet = signal<Wallet | null>(null);
  transactions = signal<Transaction[]>([]);
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (!kid) return;
    const [w, t] = await Promise.all([this.fs.getWallet(kid.id), this.fs.getTransactions(kid.id)]);
    this.wallet.set(w); this.transactions.set(t);
  }
}
