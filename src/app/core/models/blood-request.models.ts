import { BloodType } from './donor.models';
import { Hospital } from './hospital.models';

export type UrgencyLevel = 'Routine' | 'Urgent' | 'Critical';
export type RequestStatus = 'Open' | 'PartiallyFulfilled' | 'Fulfilled' | 'Cancelled' | 'Expired';

export interface CreateBloodRequestDto {
  hospitalId: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  patientContext: string;
  neededByUtc: string;
}

export interface BloodRequestSummary {
  id: string;
  hospitalId: string;
  hospital?: Hospital;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  patientContext: string;
  neededByUtc: string;
  createdAtUtc: string;
}

export interface CriticalBloodAlert {
  id: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  patientContext: string;
}