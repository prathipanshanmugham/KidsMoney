import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentLayoutComponent } from '../layouts/parent-layout';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Loan } from '../models/interfaces';

@Component({
  selector: 'app-parent-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, ParentLayoutComponent],
  template: `
    <app-parent-layout>
      <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold font-heading tracking-tight" data-testid="loans-heading">Loans & EMI</h1>
            <p class="text-sm mt-1" style="color: var(--fg-muted)">Manage loans for {{ auth.selectedKid()?.name }}</p>
          </div>
          <button (click)="showCreate.set(true)" class="btn-primary text-sm" data-testid="create-loan-btn">+ Request Loan</button>
        </div>

        @if (loans().length === 0) {
          <div class="card p-12 text-center"><p class="text-sm" style="color: var(--fg-muted)">No loans yet.</p></div>
        }

        <div class="space-y-4">
          @for (loan of loans(); track loan.id) {
            <div class="card p-6" [attr.data-testid]="'loan-' + loan.id">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold font-heading">{{ loan.purpose }}</p>
                  <p class="text-xs" style="color: var(--fg-muted)">{{ loan.principal }} coins at {{ loan.interest_rate }}% for {{ loan.duration_months }} months</p>
                </div>
                <span class="badge text-[10px]" [style.background-color]="loanColor(loan.status) + '20'" [style.color]="loanColor(loan.status)">{{ loan.status }}</span>
              </div>
              @if (loan.status !== 'pending') {
                <div class="grid grid-cols-3 gap-2 text-center mb-3">
                  <div class="p-2 rounded-xl" style="background-color: var(--muted)"><p class="text-[10px]" style="color: var(--fg-muted)">EMI</p><p class="text-sm font-bold">{{ loan.emi_amount }}</p></div>
                  <div class="p-2 rounded-xl" style="background-color: var(--muted)"><p class="text-[10px]" style="color: var(--fg-muted)">Remaining</p><p class="text-sm font-bold">{{ loan.remaining_balance }}</p></div>
                  <div class="p-2 rounded-xl" style="background-color: var(--muted)"><p class="text-[10px]" style="color: var(--fg-muted)">Paid</p><p class="text-sm font-bold">{{ loan.payments_made }}/{{ loan.duration_months }}</p></div>
                </div>
              }
              <div class="flex gap-2">
                @if (loan.status === 'pending') {
                  <button (click)="approveLoan(loan.id)" class="btn-primary text-xs" [attr.data-testid]="'approve-loan-' + loan.id">Approve Loan</button>
                }
                @if (loan.status === 'active') {
                  <button (click)="payEMI(loan)" class="btn-primary text-xs" [attr.data-testid]="'pay-emi-' + loan.id">Pay EMI ({{ loan.emi_amount }})</button>
                }
              </div>
            </div>
          }
        </div>

        @if (showCreate()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showCreate.set(false)">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="card p-8 w-full max-w-md relative z-10 animate-fade-in" (click)="$event.stopPropagation()">
              <h2 class="text-lg font-bold font-heading mb-6">Request Loan</h2>
              <form (ngSubmit)="createLoan()" class="space-y-4">
                <div><label class="label">Purpose</label><input class="input" placeholder="e.g., Buy a bicycle" [(ngModel)]="loanForm.purpose" name="purpose" data-testid="loan-purpose-input"></div>
                <div><label class="label">Amount</label><input class="input" type="number" min="10" [(ngModel)]="loanForm.principal" name="principal" data-testid="loan-amount-input"></div>
                <div class="grid grid-cols-2 gap-4">
                  <div><label class="label">Interest (%)</label><input class="input" type="number" min="0" max="20" [(ngModel)]="loanForm.interest_rate" name="rate"></div>
                  <div><label class="label">Duration (months)</label><input class="input" type="number" min="1" max="24" [(ngModel)]="loanForm.duration_months" name="months"></div>
                </div>
                <button type="submit" class="btn-primary w-full py-3" [disabled]="creating()" data-testid="submit-loan-btn">{{ creating() ? 'Creating...' : 'Request Loan' }}</button>
              </form>
            </div>
          </div>
        }
      </div>
    </app-parent-layout>
  `
})
export class ParentLoansPage implements OnInit {
  auth = inject(AuthService);
  private fs = inject(FirestoreService);
  loans = signal<Loan[]>([]);
  showCreate = signal(false);
  creating = signal(false);
  loanForm = { purpose: '', principal: 100, interest_rate: 5, duration_months: 6 };

  async ngOnInit() { await this.load(); }
  async load() { const kid = this.auth.selectedKid(); if (kid) this.loans.set(await this.fs.getLoans(kid.id)); }
  loanColor(s: string) { return { pending: '#FCD34D', active: '#4F7DF3', completed: '#34D399' }[s] || '#71717A'; }

  async createLoan() {
    if (!this.loanForm.purpose) return;
    this.creating.set(true);
    try {
      const kid = this.auth.selectedKid(); const user = this.auth.firebaseUser();
      if (!kid || !user) return;
      await this.fs.requestLoan(user.uid, kid.id, this.loanForm);
      await this.load(); this.showCreate.set(false);
    } finally { this.creating.set(false); }
  }

  async approveLoan(id: string) { await this.fs.approveLoan(id); await this.load(); }
  async payEMI(loan: Loan) {
    const kid = this.auth.selectedKid(); if (!kid) return;
    try { await this.fs.payLoanEMI(loan.id, kid.id); await this.load(); } catch (e: any) { alert(e.message); }
  }
}
