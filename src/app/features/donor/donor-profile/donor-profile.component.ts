import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonorService } from '../../../core/services/donor.service';
import { BLOOD_TYPES, BloodType, DonorProfile, formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-donor-profile',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './donor-profile.component.html'
})
export class DonorProfileComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;

  profile = signal<DonorProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  successMessage = signal<string | null>(null);

  // Form fields
  bloodType: BloodType = 'OPositive';
  weightKg = 60;
  consentToBeContacted = true;
  medicalNotes = '';

  constructor(private donorService: DonorService) {}

  ngOnInit(): void {
    this.donorService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.bloodType = profile.bloodType;
        this.weightKg = profile.weightKg;
        this.consentToBeContacted = profile.consentToBeContacted;
        this.medicalNotes = profile.medicalNotes ?? '';
        this.loading.set(false);
      },
      error: () => this.loading.set(false) // 404 is expected for first-time users
    });
  }

  onSubmit(): void {
    this.saving.set(true);
    this.successMessage.set(null);

    this.donorService.upsertProfile({
      bloodType: this.bloodType,
      weightKg: this.weightKg,
      consentToBeContacted: this.consentToBeContacted,
      medicalNotes: this.medicalNotes || null
    }).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.saving.set(false);
        this.successMessage.set('Profile saved successfully!');
      },
      error: () => this.saving.set(false)
    });
  }

  recalculateEligibility(): void {
    this.donorService.recalculateEligibility().subscribe(result => {
      this.profile.update(p => p ? { ...p, isEligibleToDonate: result.isEligibleToDonate } : p);
    });
  }
}