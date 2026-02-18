export interface UserProfile {
  uid: string;
  email: string;
  full_name: string;
  role: 'parent';
  created_at: string;
}

export interface Kid {
  id: string;
  parent_uid: string;
  name: string;
  age: number;
  avatar: string;
  grade?: string;
  ui_theme: string;
  pin: string;
  level: number;
  xp: number;
  credit_score: number;
  created_at: string;
}

export interface Wallet {
  kid_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  total_saved: number;
}

export interface Transaction {
  id: string;
  kid_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  category: string;
  reference_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  parent_uid: string;
  kid_id: string;
  title: string;
  description: string;
  reward_amount: number;
  penalty_amount: number;
  frequency: string;
  approval_required: boolean;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  created_at: string;
}

export interface Goal {
  id: string;
  kid_id: string;
  parent_uid: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  deadline?: string;
  status: 'active' | 'completed';
  created_at: string;
}

export interface SIP {
  id: string;
  kid_id: string;
  parent_uid: string;
  amount: number;
  interest_rate: number;
  frequency: string;
  total_invested: number;
  current_value: number;
  payments_made: number;
  status: 'active' | 'paused';
  created_at: string;
}

export interface Loan {
  id: string;
  kid_id: string;
  parent_uid: string;
  principal: number;
  interest_rate: number;
  duration_months: number;
  emi_amount: number;
  remaining_balance: number;
  payments_made: number;
  purpose: string;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
}

export interface LearningProgress {
  id: string;
  kid_id: string;
  story_id: string;
  score: number;
  completed_at: string;
}

export interface KidSession {
  kid: Kid;
  wallet: Wallet;
  isKid: true;
}
