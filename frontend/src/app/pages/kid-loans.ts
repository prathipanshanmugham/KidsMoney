import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KidLayoutComponent } from '../layouts/kid-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Loan } from '../models/interfaces';
import { KID_THEMES } from '../constants/app-data';

@Component({
  selector: 'app-kid-loans',
  standalone: true,
  imports: [CommonModule, KidLayoutComponent],
  template: `
    <app-kid-layout>
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold font-heading tracking-tight mb-2" data-testid="kid-loans-heading">My Loans</h1>
        <p class="text-sm mb-6" style="color: var(--fg-muted)">Manage your borrowings responsibly</p>

        @if (loans().length === 0) {
          <div class="card p-12 text-center"><p class="text-sm" style="color: var(--fg-muted)">No loans yet. That's great!</p></div>
        }

        <div class="space-y-4">
          @for (loan of loans(); track loan.id) {
            <div class="card p-6" [attr.data-testid]="'kid-loan-' + loan.id">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold font-heading">{{ loan.purpose }}</p>
                  <p class="text-xs" style="color: var(--fg-muted)">{{ loan.interest_rate }}% interest &middot; {{ loan.duration_months }} months</p>
                </div>
                <span class="badge text-[10px]" [style.background-color]="loan.status === 'active' ? theme().primary + '15' : loan.status === 'completed' ? '#34D39920' : '#FCD34D20'" [style.color]="loan.status === 'active' ? theme().primary : loan.status === 'completed' ? '#34D399' : '#FCD34D'">{{ loan.status }}</span>
              </div>
              @if (loan.status !== 'pending') {
                <div class="grid grid-cols-2 gap-2 text-center mb-3">
                  <div class="p-2 rounded-xl" style="background-color: var(--muted)"><p class="text-[10px]" style="color: var(--fg-muted)">Remaining</p><p class="text-sm font-bold">{{ loan.remaining_balance }}</p></div>
                  <div class="p-2 rounded-xl" style="background-color: var(--muted)"><p class="text-[10px]" style="color: var(--fg-muted)">Payments</p><p class="text-sm font-bold">{{ loan.payments_made }}/{{ loan.duration_months }}</p></div>
                </div>
              }
              @if (loan.status === 'active') {
                <button (click)="payEMI(loan)" class="btn-primary w-full text-xs py-2" [attr.data-testid]="'kid-pay-emi-' + loan.id">Pay EMI ({{ loan.emi_amount }} coins)</button>
              }
            </div>
          }
        </div>
      </div>
    </app-kid-layout>
  `
})
export class KidLoansPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  loans = signal<Loan[]>([]);
  theme = computed(() => KID_THEMES[this.auth.kidSession()?.kid?.ui_theme || 'neutral'] || KID_THEMES['neutral']);

  async ngOnInit() {
    const kid = this.auth.kidSession()?.kid;
    if (kid) this.loans.set(await this.fs.getLoans(kid.id));
  }

  async payEMI(loan: Loan) {
    const kid = this.auth.kidSession()?.kid;
    if (!kid) return;
    try { await this.fs.payLoanEMI(loan.id, kid.id); this.loans.set(await this.fs.getLoans(kid.id)); } catch (e: any) { alert(e.message); }
  }
}
