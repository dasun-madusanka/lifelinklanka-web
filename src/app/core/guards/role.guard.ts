import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Usage in routes: canActivate: [roleGuard(['Admin', 'HospitalStaff'])]
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const hasAccess = allowedRoles.some(role => auth.hasRole(role));
    if (!hasAccess) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
}