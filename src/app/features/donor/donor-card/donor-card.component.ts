import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DonorService } from '../../../core/services/donor.service';
import { AuthService } from '../../../core/services/auth.service';
import { DonorProfile, formatBloodType, getDonorTier, DonorTier } from '../../../core/models/donor.models';

@Component({
  selector: 'app-donor-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './donor-card.component.html'
})
export class DonorCardComponent implements OnInit {
  formatBloodType = formatBloodType;
  getDonorTier = getDonorTier;

  profile = signal<DonorProfile | null>(null);
  loading = signal(true);
  showCertificate = signal(false);

  // Cooldown calculation
  daysRemaining = signal(0);
  cooldownProgress = signal(100);
  isEligible = signal(true);

  constructor(
    private donorService: DonorService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.donorService.getMyProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.calculateCooldown(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calculateCooldown(profile: DonorProfile): void {
    if (!profile.lastDonationDateUtc) {
      this.isEligible.set(true);
      this.daysRemaining.set(0);
      this.cooldownProgress.set(100);
      return;
    }

    const lastDonation = new Date(profile.lastDonationDateUtc).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - lastDonation) / (1000 * 60 * 60 * 24));
    const intervalDays = 120; // Sri Lanka NBTS standard

    if (diffDays >= intervalDays) {
      this.isEligible.set(true);
      this.daysRemaining.set(0);
      this.cooldownProgress.set(100);
    } else {
      this.isEligible.set(false);
      const remaining = intervalDays - diffDays;
      this.daysRemaining.set(remaining);
      const progress = Math.min(100, Math.round((diffDays / intervalDays) * 100));
      this.cooldownProgress.set(progress);
    }
  }

  get tier(): DonorTier {
    const count = this.profile()?.donationsCompletedCount ?? 0;
    return getDonorTier(count);
  }

  get livesSaved(): number {
    const count = this.profile()?.donationsCompletedCount ?? 0;
    return count * 3;
  }

  openCertificate(): void {
    this.showCertificate.set(true);
  }

  closeCertificate(): void {
    this.showCertificate.set(false);
  }

  printCertificate(): void {
    window.print();
  }
}
