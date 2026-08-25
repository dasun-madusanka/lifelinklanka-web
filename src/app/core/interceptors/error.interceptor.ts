import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Access token expired/invalid and this wasn't a login attempt itself —
        // simplest safe behavior for a portfolio project: force re-login.
        // (A production app would attempt a silent refresh here first.)
        tokenStorage.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};