import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { SignalrService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private signalr: SignalrService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (result) => {
        this.loading.set(false);
        if (result.requiresMfa) {
          this.router.navigate(['/mfa-setup'], {
            state: { mfaChallengeToken: result.mfaChallengeToken, verifyMode: true }
          });
        } else {
          this.signalr.connect();
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? err.error?.title ?? (typeof err.error === 'string' ? err.error : 'Invalid email or password.');
        this.errorMessage.set(msg);
      }
    });
  }
}