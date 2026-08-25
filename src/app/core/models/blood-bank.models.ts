import { VerificationStatus } from './hospital.models';

export interface CreateBloodBankDto {
  name: string;
  district: string;
  contactPhone: string;
}

export interface BloodBank {
  id: string;
  name: string;
  district: string;
  contactPhone: string;
  verificationStatus: VerificationStatus;
}