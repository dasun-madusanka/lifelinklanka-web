import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignalrService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mfa-setup.component.html'
})
export class MfaSetupComponent implements OnInit {
  // Two distinct modes on one screen:
  // - verifyMode: user just logged in and their account already has MFA enabled —
  //   we just need a TOTP code to complete login.
  // - setup mode (default): user is enabling MFA for the first time — show QR + secret.
  verifyMode = false;
  mfaChallengeToken = '';

  qrCodeBase64 = signal<string | null>(null);
  secretKey = signal<string | null>(null);
  code = '';
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private signalr: SignalrService, private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = (window.history.state ?? {}) as any;

    if (state.verifyMode) {
      this.verifyMode = true;
      this.mfaChallengeToken = state.mfaChallengeToken;
    } else {
      // Setup mode — fetch a fresh secret + QR immediately
      this.auth.setupMfa().subscribe({
        next: (res) => {
          this.qrCodeBase64.set(res.qrCodeBase64);
          this.secretKey.set(res.secretKey);
        },
        error: () => this.errorMessage.set('Could not start MFA setup. Please try again.')
      });
    }
  }

  onVerifySubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.verifyMfa({ mfaChallengeToken: this.mfaChallengeToken, code: this.code }).subscribe({
      next: () => {
        this.loading.set(false);
        this.signalr.connect();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid or expired code. Please try again.');
      }
    });
  }

  onEnableSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.enableMfa(this.code).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('MFA enabled! Redirecting to dashboard...');
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Invalid code. Please check your authenticator app and try again.');
      }
    });
  }
}