import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BloodRequestService } from '../../core/services/blood-request.service';
import { NationalDashboardStats } from '../../core/models/analytics.models';
import { BloodRequestSummary, formatComponentType } from '../../core/models/blood-request.models';
import { formatBloodType } from '../../core/models/donor.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  formatBloodType = formatBloodType;
  formatComponentType = formatComponentType;

  stats = signal<NationalDashboardStats | null>(null);
  recentRequests = signal<BloodRequestSummary[]>([]);
  loading = signal(true);

  constructor(
    public auth: AuthService,
    private analyticsService: AnalyticsService,
    private requestService: BloodRequestService
  ) {}

  ngOnInit(): void {
    this.analyticsService.getDashboardStats().subscribe({
      next: s => this.stats.set(s)
    });

    this.requestService.getOpenRequests().subscribe({
      next: reqs => {
        this.recentRequests.set(reqs.slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get userRoleDisplayName(): string {
    if (this.auth.hasRole('Admin')) return 'System Administrator';
    if (this.auth.hasRole('HospitalStaff')) return 'Medical Officer / Hospital Staff';
    if (this.auth.hasRole('BloodBank')) return 'Blood Bank Operator';
    return 'Registered Voluntary Donor';
  }
}