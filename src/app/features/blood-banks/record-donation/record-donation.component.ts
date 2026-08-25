import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BloodBankService } from '../../../core/services/blood-bank.service';
import { AdminService } from '../../../core/services/admin.service';
import { BloodBank } from '../../../core/models/blood-bank.models';
import { AdminUserSummary } from '../../../core/models/admin.models';

@Component({
  selector: 'app-record-donation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './record-donation.component.html'
})
export class RecordDonationComponent implements OnInit {
  bloodBanks = signal<BloodBank[]>([]);
  users = signal<AdminUserSummary[]>([]);

  bloodBankId = '';
  donorUserId = '';
  volumeMl = 450;

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private bloodBankService: BloodBankService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.bloodBankService.getAll().subscribe(banks => this.bloodBanks.set(banks));
    this.adminService.getUsers(1, 100).subscribe(users => this.users.set(users));
  }

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bloodBankService.recordDonation(this.bloodBankId, this.donorUserId, this.volumeMl).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Donation recorded successfully. Donor eligibility cooldown started.');
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not record donation — check the donor has a profile.');
      }
    });
  }
}