export interface AdminUserSummary {
  id: string;
  fullName: string;
  email: string;
  district: string;
  accountStatus: string;
  isActive: boolean;
  isMfaEnabled: boolean;
  verificationDocumentUrl?: string;
  verificationDocumentName?: string;
  verificationDocumentType?: string;
  createdAtUtc?: string;
}

export interface DashboardStats {
  totalDonors: number;
  totalHospitals: number;
  openRequests: number;
  criticalRequests: number;
  pendingApprovals?: number;
}

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAtUtc: string;
}

export interface PendingUserApproval {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  nicNumber: string;
  district: string;
  dateOfBirth: string;
  role: string;
  accountStatus: string;
  createdAtUtc: string;
  verificationDocumentUrl?: string;
  verificationDocumentName?: string;
  verificationDocumentType?: string;
  facilityName?: string;
  bloodType?: string;
  weightKg?: number;
}