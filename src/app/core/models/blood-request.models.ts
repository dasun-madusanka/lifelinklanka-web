import { BloodType } from './donor.models';
import { Hospital } from './hospital.models';

export type UrgencyLevel = 'Routine' | 'Urgent' | 'Critical';
export type RequestStatus = 'Open' | 'PartiallyFulfilled' | 'Fulfilled' | 'Cancelled' | 'Expired';

export type BloodComponentType =
  | 'WholeBlood'
  | 'PackedRedBloodCells'
  | 'Platelets'
  | 'FreshFrozenPlasma'
  | 'Cryoprecipitate';

export const BLOOD_COMPONENTS: BloodComponentType[] = [
  'WholeBlood',
  'PackedRedBloodCells',
  'Platelets',
  'FreshFrozenPlasma',
  'Cryoprecipitate'
];

export function formatComponentType(comp: BloodComponentType | string): string {
  const map: Record<string, string> = {
    WholeBlood: 'Whole Blood (WB)',
    PackedRedBloodCells: 'Packed Red Cells (PRBC)',
    Platelets: 'Platelet Concentrate (PC)',
    FreshFrozenPlasma: 'Fresh Frozen Plasma (FFP)',
    Cryoprecipitate: 'Cryoprecipitate (CRYO)'
  };
  return map[comp] ?? comp;
}

export interface CreateBloodRequestDto {
  hospitalId: string;
  bloodTypeNeeded: BloodType;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  patientContext: string;
  neededByUtc: string;
  componentNeeded?: BloodComponentType;
  clinicalIndication?: string;
}

export interface UpdateBloodRequestDto {
  unitsNeeded?: number;
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  patientContext?: string;
  clinicalIndication?: string;
  neededByUtc?: string;
}


export interface BloodRequestSummary {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  district?: string;
  hospital?: Hospital;
  bloodTypeNeeded: BloodType;
  componentNeeded?: BloodComponentType;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  patientContext: string;
  clinicalIndication?: string;
  neededByUtc: string;
  createdAtUtc: string;
  matchedDonorsCount?: number;
}

export interface CriticalBloodAlert {
  id: string;
  hospitalName?: string;
  district?: string;
  bloodTypeNeeded: BloodType;
  componentNeeded?: BloodComponentType;
  unitsNeeded: number;
  urgency?: UrgencyLevel;
  patientContext: string;
  neededByUtc?: string;
  isCritical?: boolean;
}