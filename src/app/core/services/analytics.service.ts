import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NationalDashboardStats, BloodTypeDistribution, MonthlyDonationTrend, DistrictDemandSummary } from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<NationalDashboardStats> {
    return this.http.get<NationalDashboardStats>(`${this.base}/dashboard`);
  }

  getBloodDistribution(): Observable<BloodTypeDistribution[]> {
    return this.http.get<BloodTypeDistribution[]>(`${this.base}/blood-distribution`);
  }

  getMonthlyTrends(): Observable<MonthlyDonationTrend[]> {
    return this.http.get<MonthlyDonationTrend[]>(`${this.base}/monthly-trends`);
  }

  getDistrictSummaries(): Observable<DistrictDemandSummary[]> {
    return this.http.get<DistrictDemandSummary[]>(`${this.base}/districts`);
  }
}
