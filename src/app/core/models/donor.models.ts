export type BloodType =
  | 'APositive' | 'ANegative'
  | 'BPositive' | 'BNegative'
  | 'ABPositive' | 'ABNegative'
  | 'OPositive' | 'ONegative';

export const BLOOD_TYPES: BloodType[] = [
  'APositive', 'ANegative', 'BPositive', 'BNegative',
  'ABPositive', 'ABNegative', 'OPositive', 'ONegative'
];

export function formatBloodType(bt: BloodType): string {
  const map: Record<BloodType, string> = {
    APositive: 'A+', ANegative: 'A-',
    BPositive: 'B+', BNegative: 'B-',
    ABPositive: 'AB+', ABNegative: 'AB-',
    OPositive: 'O+', ONegative: 'O-'
  };
  return map[bt];
}

export interface UpsertDonorProfileDto {
  bloodType: BloodType;
  weightKg: number;
  consentToBeContacted: boolean;
  medicalNotes: string | null;
}

export interface DonationRecord {
  id: string;
  donationDateUtc: string;
  volumeMl: number;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodType: BloodType;
  weightKg: number;
  lastDonationDateUtc: string | null;
  isEligibleToDonate: boolean;
  medicalNotes: string | null;
  consentToBeContacted: boolean;
  donationHistory: DonationRecord[];
}

export interface DonorMatch {
  id: string;
  bloodRequestId: string;
  donorUserId: string;
  notifiedViaRealtime: boolean;
  donorResponded: boolean;
  donorAccepted: boolean;
  respondedAtUtc: string | null;
  bloodRequest: BloodRequestSummary;
}

// Minimal shape needed for the match list view
import type { BloodRequestSummary } from './blood-request.models';