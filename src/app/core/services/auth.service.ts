import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RegisterDto, LoginDto, LoginResultDto, MfaSetupResponseDto,
  MfaVerifyDto, TokenResponseDto, DecodedToken, UserProfile, DemoAccount
} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<DecodedToken | null>(null);
  private readonly _userProfile = signal<UserProfile | null>(null);

  readonly currentUser = computed(() => this._currentUser());
  readonly userProfile = computed(() => this._userProfile());
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
    const decoded = this.decodeStoredToken();
    this._currentUser.set(decoded);
    if (decoded) {
      this.loadCurrentUserProfile().subscribe({ error: () => {} });
    }
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

  uploadVerificationDoc(file: File, documentType: string): Observable<{ documentUrl: string; fileName: string; sizeBytes: number; documentType: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<{ documentUrl: string; fileName: string; sizeBytes: number; documentType: string }>(
      `${environment.apiUrl}/auth/upload-verification-doc`, formData
    );
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

  loadCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`).pipe(
      tap(profile => this._userProfile.set(profile))
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
    this._userProfile.set(null);
    this.router.navigate(['/login']);
  }

  private handleTokens(tokens: TokenResponseDto): void {
    this.tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    this._currentUser.set(jwtDecode<DecodedToken>(tokens.accessToken));
    this.loadCurrentUserProfile().subscribe({ error: () => {} });
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }
}