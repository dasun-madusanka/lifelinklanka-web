import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospitalService } from '../../../core/services/hospital.service';
import { AuthService } from '../../../core/services/auth.service';
import { Hospital } from '../../../core/models/hospital.models';

@Component({
  selector: 'app-register-hospital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-hospital.component.html'
})
export class RegisterHospitalComponent implements OnInit {
  name = '';
  registrationNumber = '';
  district = 'Colombo';
  address = '';
  contactPhone = '';

  districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  hospitals = signal<Hospital[]>([]);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);
  fetching = signal(true);

  constructor(
    private hospitalService: HospitalService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.fetching.set(true);
    this.hospitalService.getAll().subscribe({
      next: (list) => {
        this.hospitals.set(list);
        this.fetching.set(false);
      },
      error: () => this.fetching.set(false)
    });
  }

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.hospitalService.create({
      name: this.name,
      registrationNumber: this.registrationNumber,
      district: this.district,
      address: this.address,
      contactPhone: this.contactPhone
    }).subscribe({
      next: (created) => {
        this.loading.set(false);
        this.successMessage.set(`Hospital '${created.name}' registered successfully! It is now active.`);
        this.name = '';
        this.registrationNumber = '';
        this.address = '';
        this.contactPhone = '';
        this.loadHospitals();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.status === 409 ? 'A hospital with this registration number already exists.' : (err.error?.title ?? err.error ?? 'Submission failed.'));
      }
    });
  }

  onDelete(id: string, name: string): void {
    if (!confirm(`Are you sure you want to remove '${name}'?`)) return;
    this.hospitalService.delete(id).subscribe({
      next: () => {
        this.hospitals.update(list => list.filter(h => h.id !== id));
        this.successMessage.set(`Hospital '${name}' removed successfully.`);
      },
      error: () => this.errorMessage.set('Failed to delete hospital. You must be the creator or an Administrator.')
    });
  }
}