import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Wallet, Transaction } from '../models/interfaces';

@Component({
  selector: 'app-parent-wallet',
  standalone: true,
  imports: [CommonModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="wallet-heading">Wallet</h1>
        <p class="text-sm mb-8" style="color: var(--fg-muted)">{{ auth.selectedKid()?.name }}'s financial overview</p>

        @if (wallet()) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="card p-5"><p class="text-xs" style="color: var(--fg-muted)">Balance</p><p class="text-2xl font-bold font-heading">{{ wallet()!.balance }}</p></div>
            <div class="card p-5"><p class="text-xs" style="color: var(--fg-muted)">Earned</p><p class="text-2xl font-bold font-heading text-secondary">{{ wallet()!.total_earned }}</p></div>
            <div class="card p-5"><p class="text-xs" style="color: var(--fg-muted)">Spent</p><p class="text-2xl font-bold font-heading text-red-400">{{ wallet()!.total_spent }}</p></div>
            <div class="card p-5"><p class="text-xs" style="color: var(--fg-muted)">Saved</p><p class="text-2xl font-bold font-heading text-primary">{{ wallet()!.total_saved }}</p></div>
          </div>
        }

        <div class="card p-6">
          <h3 class="text-sm font-semibold font-heading mb-4">Transaction History</h3>
          @if (transactions().length === 0) {
            <p class="text-sm text-center py-8" style="color: var(--fg-muted)">No transactions yet</p>
          }
          <div class="space-y-3">
            @for (txn of transactions(); track txn.id) {
              <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: var(--muted)">
                <div>
                  <p class="text-sm font-medium">{{ txn.description }}</p>
                  <p class="text-[10px]" style="color: var(--fg-muted)">{{ txn.created_at | date:'short' }} &middot; {{ txn.category }}</p>
                </div>
                <span class="text-sm font-bold" [style.color]="txn.type === 'credit' ? '#34D399' : '#F87171'">
                  {{ txn.type === 'credit' ? '+' : '-' }}{{ txn.amount }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </app-parent-layout>
  `
})
export class ParentWalletPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  wallet = signal<Wallet | null>(null);
  transactions = signal<Transaction[]>([]);

  async ngOnInit() {
    const kid = this.auth.selectedKid();
    if (!kid) return;
    const [w, t] = await Promise.all([this.fs.getWallet(kid.id), this.fs.getTransactions(kid.id)]);
    this.wallet.set(w);
    this.transactions.set(t);
  }
}
