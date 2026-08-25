export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface CreateHospitalDto {
  name: string;
  registrationNumber: string;
  district: string;
  address: string;
  contactPhone: string;
}

export interface Hospital {
  id: string;
  name: string;
  registrationNumber: string;
  district: string;
  address: string;
  contactPhone: string;
  verificationStatus: VerificationStatus;
  createdByUserId: string;
}