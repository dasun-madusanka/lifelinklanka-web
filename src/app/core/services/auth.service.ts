import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegisterDto, LoginDto, LoginResultDto, MfaSetupResponseDto,
  MfaVerifyDto, TokenResponseDto, DecodedToken
} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Declare the signal WITHOUT calling decodeStoredToken() here —
  // property initializers run before the constructor body, so
  // this.tokenStorage would still be undefined at this point.
  private readonly _currentUser = signal<DecodedToken | null>(null);

  readonly currentUser = computed(() => this._currentUser());
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly roles = computed(() => {
    const user = this._currentUser();
    if (!user) return [];
    return Array.isArray(user.role) ? user.role : [user.role];
  });

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Now tokenStorage is guaranteed to be assigned — safe to call here.
    this._currentUser.set(this.decodeStoredToken());
  }

  private decodeStoredToken(): DecodedToken | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded.exp * 1000 < Date.now()) return null; // expired
      return decoded;
    } catch {
      return null;
    }
  }

  register(dto: RegisterDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, dto);
  }

  login(dto: LoginDto): Observable<LoginResultDto> {
    return this.http.post<LoginResultDto>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(result => {
        if (result.tokens) {
          this.handleTokens(result.tokens);
        }
      })
    );
  }

  verifyMfa(dto: MfaVerifyDto): Observable<TokenResponseDto> {
    return this.http.post<TokenResponseDto>(`${environment.apiUrl}/auth/mfa/verify`, dto).pipe(
      tap(tokens => this.handleTokens(tokens))
    );
  }

  setupMfa(): Observable<MfaSetupResponseDto> {
    return this.http.post<MfaSetupResponseDto>(`${environment.apiUrl}/auth/mfa/setup`, {});
  }

  enableMfa(code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/mfa/enable`, JSON.stringify(code), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  refreshToken(): Observable<TokenResponseDto> {
    const body = {
      accessToken: this.tokenStorage.getAccessToken(),
      refreshToken: this.tokenStorage.getRefreshToken()
    };
    return this.http.post<TokenResponseDto>(`${environment.apiUrl}/auth/refresh`, body).pipe(
      tap(tokens => this.handleTokens(tokens))
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.finalizeLogout(),
      error: () => this.finalizeLogout() // log out client-side even if the API call fails
    });
  }

  private finalizeLogout(): void {
    this.tokenStorage.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private handleTokens(tokens: TokenResponseDto): void {
    this.tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    this._currentUser.set(jwtDecode<DecodedToken>(tokens.accessToken));
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}