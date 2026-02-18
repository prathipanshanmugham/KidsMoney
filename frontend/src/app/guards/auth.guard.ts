import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const parentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.loading()) return false;
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (auth.isKid()) { router.navigate(['/kid/dashboard']); return false; }
  return true;
};

export const kidGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.loading()) return false;
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (auth.isParent()) { router.navigate(['/dashboard']); return false; }
  return true;
};

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.loading()) return false;
  if (auth.isParent()) { router.navigate(['/dashboard']); return false; }
  if (auth.isKid()) { router.navigate(['/kid/dashboard']); return false; }
  return true;
};
