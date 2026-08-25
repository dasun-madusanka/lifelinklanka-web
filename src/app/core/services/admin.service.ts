import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminUserSummary, AuditLog, DashboardStats } from '../models/admin.models';
import { Hospital } from '../models/hospital.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.base}/dashboard-stats`);
  }

  getUsers(page = 1, pageSize = 20) {
    return this.http.get<AdminUserSummary[]>(`${this.base}/users?page=${page}&pageSize=${pageSize}`);
  }

  toggleActive(userId: string) {
    return this.http.post<{ id: string; isActive: boolean }>(`${this.base}/users/${userId}/toggle-active`, {});
  }

  assignRole(userId: string, role: string) {
    return this.http.post(`${this.base}/users/${userId}/assign-role`, JSON.stringify(role), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getPendingHospitals() {
    return this.http.get<Hospital[]>(`${this.base}/hospitals/pending`);
  }

  verifyHospital(id: string, approve: boolean) {
    return this.http.post<Hospital>(`${this.base}/hospitals/${id}/verify?approve=${approve}`, {});
  }

  getAuditLogs(page = 1, pageSize = 50) {
    return this.http.get<AuditLog[]>(`${this.base}/audit-logs?page=${page}&pageSize=${pageSize}`);
  }
}