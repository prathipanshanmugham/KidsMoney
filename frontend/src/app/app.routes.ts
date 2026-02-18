import { Routes } from '@angular/router';
import { parentGuard, kidGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing').then(m => m.LandingPage), canActivate: [publicGuard] },
  { path: 'login', loadComponent: () => import('./pages/login').then(m => m.LoginPage), canActivate: [publicGuard] },
  { path: 'signup', loadComponent: () => import('./pages/signup').then(m => m.SignupPage), canActivate: [publicGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/parent-dashboard').then(m => m.ParentDashboardPage), canActivate: [parentGuard] },
  { path: 'tasks', loadComponent: () => import('./pages/parent-tasks').then(m => m.ParentTasksPage), canActivate: [parentGuard] },
  { path: 'wallet', loadComponent: () => import('./pages/parent-wallet').then(m => m.ParentWalletPage), canActivate: [parentGuard] },
  { path: 'goals', loadComponent: () => import('./pages/parent-goals').then(m => m.ParentGoalsPage), canActivate: [parentGuard] },
  { path: 'sip', loadComponent: () => import('./pages/parent-sip').then(m => m.ParentSIPPage), canActivate: [parentGuard] },
  { path: 'loans', loadComponent: () => import('./pages/parent-loans').then(m => m.ParentLoansPage), canActivate: [parentGuard] },
  { path: 'learning', loadComponent: () => import('./pages/parent-learning').then(m => m.ParentLearningPage), canActivate: [parentGuard] },
  { path: 'settings', loadComponent: () => import('./pages/parent-settings').then(m => m.ParentSettingsPage), canActivate: [parentGuard] },
  { path: 'kid/dashboard', loadComponent: () => import('./pages/kid-home').then(m => m.KidHomePage), canActivate: [kidGuard] },
  { path: 'kid/tasks', loadComponent: () => import('./pages/kid-tasks').then(m => m.KidTasksPage), canActivate: [kidGuard] },
  { path: 'kid/wallet', loadComponent: () => import('./pages/kid-wallet').then(m => m.KidWalletPage), canActivate: [kidGuard] },
  { path: 'kid/goals', loadComponent: () => import('./pages/kid-goals').then(m => m.KidGoalsPage), canActivate: [kidGuard] },
  { path: 'kid/sip', loadComponent: () => import('./pages/kid-sip').then(m => m.KidSIPPage), canActivate: [kidGuard] },
  { path: 'kid/loans', loadComponent: () => import('./pages/kid-loans').then(m => m.KidLoansPage), canActivate: [kidGuard] },
  { path: 'kid/learning', loadComponent: () => import('./pages/kid-learning').then(m => m.KidLearningPage), canActivate: [kidGuard] },
  { path: 'kid/achievements', loadComponent: () => import('./pages/kid-achievements').then(m => m.KidAchievementsPage), canActivate: [kidGuard] },
  { path: '**', redirectTo: '' }
];
