import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BloodBankService } from '../../../core/services/blood-bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { BloodBank } from '../../../core/models/blood-bank.models';
import { formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-record-donation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-donation.component.html'
})
export class RecordDonationComponent implements OnInit {
  formatBloodType = formatBloodType;

  bloodBanks = signal<BloodBank[]>([]);
  bloodBankId = '';
  volumeMl = 450;

  // Donor Search
  donorSearchQuery = '';
  searchingDonor = signal(false);
  foundDonor = signal<any | null>(null);
  searchError = signal<string | null>(null);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private bloodBankService: BloodBankService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.bloodBankService.getAll().subscribe(banks => {
      this.bloodBanks.set(banks);
      if (banks.length > 0 && !this.bloodBankId) {
        this.bloodBankId = banks[0].id;
      }
    });
  }

  searchDonor(): void {
    if (!this.donorSearchQuery.trim()) return;

    this.searchingDonor.set(true);
    this.searchError.set(null);
    this.foundDonor.set(null);

    this.bloodBankService.findDonor(this.donorSearchQuery.trim()).subscribe({
      next: (donor) => {
        this.foundDonor.set(donor);
        this.searchingDonor.set(false);
      },
      error: (err) => {
        this.searchingDonor.set(false);
        this.searchError.set(err.error ?? 'No registered donor profile found with this NIC or Email.');
      }
    });
  }

  onSubmit(): void {
    const donor = this.foundDonor();
    if (!donor) {
      this.errorMessage.set('Please lookup and verify a registered donor first.');
      return;
    }

    if (!this.bloodBankId) {
      this.errorMessage.set('Please select the recording blood bank.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.bloodBankService.recordDonation(this.bloodBankId, donor.userId, this.volumeMl).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(`Donation of ${this.volumeMl} mL for donor ${donor.fullName} recorded successfully. 120-day NBTS cooldown activated.`);
        this.foundDonor.set(null);
        this.donorSearchQuery = '';
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.title ?? 'Could not record donation. Verify donor details.');
      }
    });
  }
}