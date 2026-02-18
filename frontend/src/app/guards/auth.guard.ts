import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

function waitForAuth(auth: AuthService): Promise<void> {
  return new Promise(resolve => {
    if (!auth.loading()) { resolve(); return; }
    const interval = setInterval(() => {
      if (!auth.loading()) { clearInterval(interval); resolve(); }
    }, 50);
  });
}

export const parentGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForAuth(auth);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (auth.isKid()) { router.navigate(['/kid/dashboard']); return false; }
  return true;
};

export const kidGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForAuth(auth);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (auth.isParent()) { router.navigate(['/dashboard']); return false; }
  return true;
};

export const publicGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await waitForAuth(auth);
  if (auth.isParent()) { router.navigate(['/dashboard']); return false; }
  if (auth.isKid()) { router.navigate(['/kid/dashboard']); return false; }
  return true;
};
