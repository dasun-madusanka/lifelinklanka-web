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
  return map[bt] ?? bt;
}

export type DonorTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum Life-Saver';

export function getDonorTier(donationCount: number): DonorTier {
  if (donationCount >= 25) return 'Platinum Life-Saver';
  if (donationCount >= 10) return 'Gold';
  if (donationCount >= 5) return 'Silver';
  return 'Bronze';
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
  donationsCompletedCount: number;
  totalVolumeMl: number;
  donorCardNumber: string | null;
  donationHistory: DonationRecord[];
}

import type { BloodRequestSummary } from './blood-request.models';

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