import { BloodType } from './donor.models';

export type CampStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface BloodCamp {
  id: string;
  title: string;
  organizerName: string;
  district: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  startDateUtc: string;
  endDateUtc: string;
  targetUnits: number;
  unitsCollected: number;
  contactPhone: string;
  specialInstructions?: string;
  status: CampStatus | number;
  registeredDonorsCount: number;
}

export interface CreateBloodCampDto {
  title: string;
  organizerName: string;
  district: string;
  venueAddress: string;
  latitude?: number;
  longitude?: number;
  startDateUtc: string;
  endDateUtc: string;
  targetUnits: number;
  contactPhone: string;
  specialInstructions?: string;
}

export interface RegisterCampDto {
  donorName: string;
  contactPhone: string;
  bloodTypePledged: BloodType;
}

export interface CampRegistration {
  id: string;
  bloodCampId: string;
  campTitle: string;
  donorName: string;
  contactPhone: string;
  bloodTypePledged: BloodType;
  registeredAtUtc: string;
  attended: boolean;
}
