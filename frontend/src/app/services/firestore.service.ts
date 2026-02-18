import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, addDoc, increment
} from '@angular/fire/firestore';
import { Kid, Wallet, Transaction, Task, Goal, SIP, Loan, LearningProgress } from '../models/interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private fs = inject(Firestore);

  // ====== KIDS ======
  async addKid(parentUid: string, data: Partial<Kid> & { starting_balance?: number }): Promise<Kid> {
    const id = uuidv4();
    const kid: Kid = {
      id, parent_uid: parentUid, name: data.name!, age: data.age!,
      avatar: data.avatar || 'panda', grade: data.grade || '',
      ui_theme: data.ui_theme || 'neutral', pin: data.pin || '',
      level: 1, xp: 0, credit_score: 500,
      created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'kids', id), kid);
    const balance = data.starting_balance || 0;
    const wallet: Wallet = { kid_id: id, balance, total_earned: balance, total_spent: 0, total_saved: 0 };
    await setDoc(doc(this.fs, 'wallets', id), wallet);
    if (balance > 0) {
      await this.addTransaction(id, 'credit', balance, 'Starting balance', 'initial');
    }
    return kid;
  }

  async getKids(parentUid: string): Promise<Kid[]> {
    const q = query(collection(this.fs, 'kids'), where('parent_uid', '==', parentUid));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Kid);
  }

  async getKid(kidId: string): Promise<Kid | null> {
    const snap = await getDoc(doc(this.fs, 'kids', kidId));
    return snap.exists() ? snap.data() as Kid : null;
  }

  async updateKid(kidId: string, data: Partial<Kid>) {
    await updateDoc(doc(this.fs, 'kids', kidId), data as any);
  }

  async deleteKid(kidId: string) {
    await deleteDoc(doc(this.fs, 'kids', kidId));
    await deleteDoc(doc(this.fs, 'wallets', kidId));
    const collections = ['transactions', 'tasks', 'goals', 'sips', 'loans', 'learning_progress'];
    for (const col of collections) {
      const q = query(collection(this.fs, col), where('kid_id', '==', kidId));
      const snap = await getDocs(q);
      for (const d of snap.docs) await deleteDoc(d.ref);
    }
  }

  // ====== WALLET ======
  async getWallet(kidId: string): Promise<Wallet> {
    const snap = await getDoc(doc(this.fs, 'wallets', kidId));
    return snap.exists() ? snap.data() as Wallet : { kid_id: kidId, balance: 0, total_earned: 0, total_spent: 0, total_saved: 0 };
  }

  async creditWallet(kidId: string, amount: number) {
    await updateDoc(doc(this.fs, 'wallets', kidId), { balance: increment(amount), total_earned: increment(amount) });
  }

  async debitWallet(kidId: string, amount: number) {
    const wallet = await this.getWallet(kidId);
    if (wallet.balance < amount) throw new Error('Insufficient balance');
    await updateDoc(doc(this.fs, 'wallets', kidId), { balance: increment(-amount), total_spent: increment(amount) });
  }

  async saveFromWallet(kidId: string, amount: number) {
    const wallet = await this.getWallet(kidId);
    if (wallet.balance < amount) throw new Error('Insufficient balance');
    await updateDoc(doc(this.fs, 'wallets', kidId), { balance: increment(-amount), total_saved: increment(amount) });
  }

  // ====== TRANSACTIONS ======
  async addTransaction(kidId: string, type: 'credit' | 'debit', amount: number, description: string, category: string, referenceId?: string) {
    const txn: Transaction = {
      id: uuidv4(), kid_id: kidId, type, amount, description, category,
      reference_id: referenceId || '', created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'transactions', txn.id), txn);
  }

  async getTransactions(kidId: string, max = 50): Promise<Transaction[]> {
    const q = query(collection(this.fs, 'transactions'), where('kid_id', '==', kidId), orderBy('created_at', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Transaction);
  }

  // ====== TASKS ======
  async createTask(parentUid: string, kidId: string, data: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: uuidv4(), parent_uid: parentUid, kid_id: kidId,
      title: data.title!, description: data.description || '',
      reward_amount: data.reward_amount!, penalty_amount: data.penalty_amount || 0,
      frequency: data.frequency || 'one-time', approval_required: data.approval_required !== false,
      status: 'pending', created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'tasks', task.id), task);
    return task;
  }

  async getTasks(kidId: string): Promise<Task[]> {
    const q = query(collection(this.fs, 'tasks'), where('kid_id', '==', kidId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Task);
  }

  async completeTask(taskId: string, kidId: string): Promise<Task> {
    const snap = await getDoc(doc(this.fs, 'tasks', taskId));
    const task = snap.data() as Task;
    if (task.approval_required) {
      await updateDoc(doc(this.fs, 'tasks', taskId), { status: 'completed' });
    } else {
      await updateDoc(doc(this.fs, 'tasks', taskId), { status: 'approved' });
      await this.creditWallet(kidId, task.reward_amount);
      await this.addTransaction(kidId, 'credit', task.reward_amount, `Task reward: ${task.title}`, 'task', taskId);
      await this.addXp(kidId, 10);
      await this.updateCreditScore(kidId, 10);
    }
    return { ...task, status: task.approval_required ? 'completed' : 'approved' };
  }

  async approveTask(taskId: string): Promise<void> {
    const snap = await getDoc(doc(this.fs, 'tasks', taskId));
    const task = snap.data() as Task;
    await updateDoc(doc(this.fs, 'tasks', taskId), { status: 'approved' });
    await this.creditWallet(task.kid_id, task.reward_amount);
    await this.addTransaction(task.kid_id, 'credit', task.reward_amount, `Task approved: ${task.title}`, 'task', taskId);
    await this.addXp(task.kid_id, 10);
    await this.updateCreditScore(task.kid_id, 10);
  }

  async rejectTask(taskId: string): Promise<void> {
    const snap = await getDoc(doc(this.fs, 'tasks', taskId));
    const task = snap.data() as Task;
    await updateDoc(doc(this.fs, 'tasks', taskId), { status: 'rejected' });
    if (task.penalty_amount > 0) {
      try {
        await this.debitWallet(task.kid_id, task.penalty_amount);
        await this.addTransaction(task.kid_id, 'debit', task.penalty_amount, `Task penalty: ${task.title}`, 'penalty', taskId);
      } catch {}
    }
    await this.updateCreditScore(task.kid_id, -10);
  }

  // ====== GOALS ======
  async createGoal(parentUid: string, kidId: string, data: Partial<Goal>): Promise<Goal> {
    const goal: Goal = {
      id: uuidv4(), kid_id: kidId, parent_uid: parentUid,
      title: data.title!, target_amount: data.target_amount!,
      saved_amount: 0, deadline: data.deadline || '',
      status: 'active', created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'goals', goal.id), goal);
    return goal;
  }

  async getGoals(kidId: string): Promise<Goal[]> {
    const q = query(collection(this.fs, 'goals'), where('kid_id', '==', kidId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Goal);
  }

  async contributeToGoal(goalId: string, kidId: string, amount: number) {
    await this.saveFromWallet(kidId, amount);
    const snap = await getDoc(doc(this.fs, 'goals', goalId));
    const goal = snap.data() as Goal;
    const newSaved = goal.saved_amount + amount;
    const status = newSaved >= goal.target_amount ? 'completed' : 'active';
    await updateDoc(doc(this.fs, 'goals', goalId), { saved_amount: newSaved, status });
    await this.addTransaction(kidId, 'debit', amount, `Goal savings: ${goal.title}`, 'goal', goalId);
    await this.addXp(kidId, 20);
    await this.updateCreditScore(kidId, 5);
  }

  async deleteGoal(goalId: string) {
    const snap = await getDoc(doc(this.fs, 'goals', goalId));
    const goal = snap.data() as Goal;
    if (goal.saved_amount > 0) {
      await updateDoc(doc(this.fs, 'wallets', goal.kid_id), { balance: increment(goal.saved_amount), total_saved: increment(-goal.saved_amount) });
      await this.addTransaction(goal.kid_id, 'credit', goal.saved_amount, `Goal refund: ${goal.title}`, 'goal_refund', goalId);
    }
    await deleteDoc(doc(this.fs, 'goals', goalId));
  }

  // ====== SIP ======
  async createSIP(parentUid: string, kidId: string, data: Partial<SIP>): Promise<SIP> {
    const sip: SIP = {
      id: uuidv4(), kid_id: kidId, parent_uid: parentUid,
      amount: data.amount!, interest_rate: data.interest_rate || 8,
      frequency: data.frequency || 'monthly', total_invested: 0,
      current_value: 0, payments_made: 0, status: 'active',
      created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'sips', sip.id), sip);
    return sip;
  }

  async getSIPs(kidId: string): Promise<SIP[]> {
    const q = query(collection(this.fs, 'sips'), where('kid_id', '==', kidId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SIP);
  }

  async paySIP(sipId: string, kidId: string) {
    const snap = await getDoc(doc(this.fs, 'sips', sipId));
    const sip = snap.data() as SIP;
    await this.saveFromWallet(kidId, sip.amount);
    const newInvested = sip.total_invested + sip.amount;
    const payments = sip.payments_made + 1;
    const monthlyRate = sip.interest_rate / 100 / 12;
    const newValue = monthlyRate > 0 ? sip.amount * ((Math.pow(1 + monthlyRate, payments) - 1) / monthlyRate) * (1 + monthlyRate) : newInvested;
    await updateDoc(doc(this.fs, 'sips', sipId), { total_invested: newInvested, current_value: Math.round(newValue * 100) / 100, payments_made: payments });
    await this.addTransaction(kidId, 'debit', sip.amount, `SIP payment #${payments}`, 'sip', sipId);
    await this.addXp(kidId, 15);
    await this.updateCreditScore(kidId, 5);
  }

  async toggleSIP(sipId: string) {
    const snap = await getDoc(doc(this.fs, 'sips', sipId));
    const sip = snap.data() as SIP;
    await updateDoc(doc(this.fs, 'sips', sipId), { status: sip.status === 'active' ? 'paused' : 'active' });
  }

  // ====== LOANS ======
  async requestLoan(parentUid: string, kidId: string, data: Partial<Loan>): Promise<Loan> {
    const monthlyRate = (data.interest_rate || 5) / 100 / 12;
    const months = data.duration_months || 6;
    const principal = data.principal!;
    const emi = monthlyRate > 0 ? principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : principal / months;
    const loan: Loan = {
      id: uuidv4(), kid_id: kidId, parent_uid: parentUid,
      principal, interest_rate: data.interest_rate || 5,
      duration_months: months, emi_amount: Math.round(emi * 100) / 100,
      remaining_balance: principal, payments_made: 0,
      purpose: data.purpose!, status: 'pending',
      created_at: new Date().toISOString()
    };
    await setDoc(doc(this.fs, 'loans', loan.id), loan);
    return loan;
  }

  async getLoans(kidId: string): Promise<Loan[]> {
    const q = query(collection(this.fs, 'loans'), where('kid_id', '==', kidId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Loan);
  }

  async approveLoan(loanId: string) {
    const snap = await getDoc(doc(this.fs, 'loans', loanId));
    const loan = snap.data() as Loan;
    await updateDoc(doc(this.fs, 'loans', loanId), { status: 'active' });
    await this.creditWallet(loan.kid_id, loan.principal);
    await this.addTransaction(loan.kid_id, 'credit', loan.principal, `Loan approved: ${loan.purpose}`, 'loan', loanId);
  }

  async payLoanEMI(loanId: string, kidId: string) {
    const snap = await getDoc(doc(this.fs, 'loans', loanId));
    const loan = snap.data() as Loan;
    const payAmount = Math.min(loan.emi_amount, loan.remaining_balance);
    await this.debitWallet(kidId, payAmount);
    const newRemaining = Math.round((loan.remaining_balance - payAmount) * 100) / 100;
    const payments = loan.payments_made + 1;
    const status = newRemaining <= 0 ? 'completed' : 'active';
    await updateDoc(doc(this.fs, 'loans', loanId), { remaining_balance: Math.max(0, newRemaining), payments_made: payments, status });
    await this.addTransaction(kidId, 'debit', payAmount, `EMI payment #${payments}`, 'emi', loanId);
    await this.addXp(kidId, 15);
    await this.updateCreditScore(kidId, 15);
  }

  // ====== LEARNING ======
  async getLearningProgress(kidId: string): Promise<LearningProgress[]> {
    const q = query(collection(this.fs, 'learning_progress'), where('kid_id', '==', kidId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as LearningProgress);
  }

  async completeLesson(kidId: string, storyId: string, score: number, rewardXp: number): Promise<{ already_completed: boolean; xp_earned: number }> {
    const q = query(collection(this.fs, 'learning_progress'), where('kid_id', '==', kidId), where('story_id', '==', storyId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existing = snap.docs[0].data() as LearningProgress;
      if (score > existing.score) {
        await updateDoc(snap.docs[0].ref, { score });
      }
      return { already_completed: true, xp_earned: 0 };
    }
    const progress: LearningProgress = { id: uuidv4(), kid_id: kidId, story_id: storyId, score, completed_at: new Date().toISOString() };
    await setDoc(doc(this.fs, 'learning_progress', progress.id), progress);
    await this.addXp(kidId, rewardXp);
    return { already_completed: false, xp_earned: rewardXp };
  }

  // ====== HELPERS ======
  async addXp(kidId: string, amount: number) {
    const kid = await this.getKid(kidId);
    if (!kid) return;
    const newXp = kid.xp + amount;
    const { getLevelForXp } = await import('../constants/app-data');
    const lvl = getLevelForXp(newXp);
    await updateDoc(doc(this.fs, 'kids', kidId), { xp: newXp, level: lvl.level });
  }

  async updateCreditScore(kidId: string, change: number) {
    const kid = await this.getKid(kidId);
    if (!kid) return;
    const newScore = Math.max(0, Math.min(1000, kid.credit_score + change));
    await updateDoc(doc(this.fs, 'kids', kidId), { credit_score: newScore });
  }

  // ====== DASHBOARD DATA ======
  async getKidDashboard(kidId: string) {
    const [kid, wallet, tasks, transactions, goals, sips, loans, learning] = await Promise.all([
      this.getKid(kidId), this.getWallet(kidId), this.getTasks(kidId),
      this.getTransactions(kidId, 10), this.getGoals(kidId),
      this.getSIPs(kidId), this.getLoans(kidId), this.getLearningProgress(kidId)
    ]);
    const { getLevelForXp, getNextLevel } = await import('../constants/app-data');
    const levelInfo = getLevelForXp(kid?.xp || 0);
    const nextLevel = getNextLevel(levelInfo.level);
    const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'completed');
    const activeGoals = goals.filter(g => g.status === 'active');
    const activeSips = sips.filter(s => s.status === 'active');
    const activeLoans = loans.filter(l => l.status === 'pending' || l.status === 'active');
    return {
      kid, wallet, level_info: levelInfo, next_level: nextLevel,
      active_tasks: activeTasks, recent_transactions: transactions,
      active_goals: activeGoals, active_sips: activeSips, active_loans: activeLoans,
      learning_progress: learning,
      stats: {
        total_tasks_completed: tasks.filter(t => t.status === 'approved').length,
        total_stories_read: learning.length,
        active_goals_count: activeGoals.length,
        active_sips_count: activeSips.length,
      }
    };
  }

  async getKidAchievements(kidId: string) {
    const [kid, tasks, learning, goals, sips, loans] = await Promise.all([
      this.getKid(kidId), this.getTasks(kidId), this.getLearningProgress(kidId),
      this.getGoals(kidId), this.getSIPs(kidId), this.getLoans(kidId)
    ]);
    const tasksDone = tasks.filter(t => t.status === 'approved').length;
    const storiesDone = learning.length;
    const goalsDone = goals.filter(g => g.status === 'completed').length;
    const sipPayments = sips.reduce((sum, s) => sum + s.payments_made, 0);
    const loanPayments = loans.reduce((sum, l) => sum + l.payments_made, 0);
    const { getLevelForXp } = await import('../constants/app-data');
    const levelInfo = getLevelForXp(kid?.xp || 0);
    const badges: any[] = [];
    if (tasksDone >= 1) badges.push({ name: 'First Task', icon: 'check-circle', desc: 'Completed your first task' });
    if (tasksDone >= 10) badges.push({ name: 'Task Pro', icon: 'check-square', desc: 'Completed 10 tasks' });
    if (storiesDone >= 1) badges.push({ name: 'Bookworm', icon: 'book-open', desc: 'Read your first story' });
    if (storiesDone >= 5) badges.push({ name: 'Scholar', icon: 'graduation-cap', desc: 'Read all stories' });
    if (goalsDone >= 1) badges.push({ name: 'Goal Getter', icon: 'target', desc: 'Achieved your first goal' });
    if (sipPayments >= 3) badges.push({ name: 'Investor', icon: 'trending-up', desc: 'Made 3 SIP payments' });
    if (loanPayments >= 1) badges.push({ name: 'Responsible', icon: 'shield', desc: 'Made your first EMI payment' });
    if ((kid?.credit_score || 500) >= 700) badges.push({ name: 'Credit Star', icon: 'star', desc: 'Credit score above 700' });
    return {
      badges, stats: { tasks_completed: tasksDone, stories_read: storiesDone, goals_achieved: goalsDone, sip_payments: sipPayments, loan_payments: loanPayments },
      level_info: levelInfo, credit_score: kid?.credit_score || 500, xp: kid?.xp || 0
    };
  }
}
