export interface AdminUserSummary {
  id: string;
  fullName: string;
  email: string;
  district: string;
  accountStatus: string;
  isActive: boolean;
  isMfaEnabled: boolean;
}

export interface DashboardStats {
  totalDonors: number;
  totalHospitals: number;
  openRequests: number;
  criticalRequests: number;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAtUtc: string;
}