import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HospitalService } from '../../../core/services/hospital.service';

@Component({
  selector: 'app-register-hospital',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-hospital.component.html'
})
export class RegisterHospitalComponent {
  name = '';
  registrationNumber = '';
  district = '';
  address = '';
  contactPhone = '';

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private hospitalService: HospitalService) {}

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.hospitalService.create({
      name: this.name,
      registrationNumber: this.registrationNumber,
      district: this.district,
      address: this.address,
      contactPhone: this.contactPhone
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Hospital submitted for verification. An admin will review it shortly.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.status === 409 ? 'A hospital with this registration number already exists.' : 'Submission failed.');
      }
    });
  }
}