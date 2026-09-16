import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DashboardStats } from '../../../core/models/admin.models';
import { NationalDashboardStats, BloodTypeDistribution, MonthlyDonationTrend } from '../../../core/models/analytics.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  nationalStats = signal<NationalDashboardStats | null>(null);
  distribution = signal<BloodTypeDistribution[]>([]);
  trends = signal<MonthlyDonationTrend[]>([]);
  loading = signal(true);

  constructor(
    private adminService: AdminService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe(stats => this.stats.set(stats));

    this.analyticsService.getDashboardStats().subscribe(ns => this.nationalStats.set(ns));

    this.analyticsService.getBloodDistribution().subscribe(dist => this.distribution.set(dist));

    this.analyticsService.getMonthlyTrends().subscribe(tr => {
      this.trends.set(tr);
      this.loading.set(false);
    });
  }
}