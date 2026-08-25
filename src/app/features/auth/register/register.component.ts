import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  nicNumber = '';
  district = '';
  dateOfBirth = '';

  districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      nicNumber: this.nicNumber,
      district: this.district,
      dateOfBirth: this.dateOfBirth,
      role: 'Donor'
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractError(err));
      }
    });
  }

  private extractError(err: any): string {
    if (err.error?.errors) {
      // FluentValidation error shape: { errors: { FieldName: ["msg1", "msg2"] } }
      const messages = Object.values(err.error.errors).flat();
      return messages.join(' ');
    }
    return err.error?.[0]?.description ?? 'Registration failed. Please check your details.';
  }
}