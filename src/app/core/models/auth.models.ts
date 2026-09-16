export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  nicNumber: string;
  district: string;
  dateOfBirth: string; // ISO date string
  role: string;
  phoneNumber?: string;
  bloodType?: string;
  weightKg?: number;
  hospitalName?: string;
  hospitalRegistrationNumber?: string;
  hospitalDistrict?: string;
  hospitalAddress?: string;
  hospitalContactPhone?: string;
  bloodBankName?: string;
  bloodBankDistrict?: string;
  bloodBankAddress?: string;
  bloodBankContactPhone?: string;
  verificationDocumentUrl?: string;
  verificationDocumentName?: string;
  verificationDocumentType?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenResponseDto {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
}

export interface LoginResultDto {
  requiresMfa: boolean;
  mfaChallengeToken?: string;
  tokens?: TokenResponseDto;
}

export interface MfaSetupResponseDto {
  secretKey: string;
  qrCodeBase64: string;
}

export interface MfaVerifyDto {
  mfaChallengeToken: string;
  code: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  fullName: string;
  mfaEnabled: string;
  role: string | string[];
  exp: number;
}

export interface AffiliatedFacility {
  type: 'Hospital' | 'BloodBank';
  id: string;
  name: string;
  district: string;
  address?: string;
  contactPhone: string;
  registrationNumber?: string;
}

export interface UserDonorProfile {
  bloodType: string;
  weightKg: number;
  isEligibleToDonate: boolean;
  lastDonationDateUtc?: string;
  donationsCompletedCount: number;
  totalVolumeDonatedMl: number;
  donorCardNumber: string;
  consentToBeContacted: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  district: string;
  nicNumber: string;
  dateOfBirth: string;
  phoneNumber?: string;
  isMfaEnabled: boolean;
  accountStatus: string;
  roles: string[];
  affiliatedFacility?: AffiliatedFacility;
  donorProfile?: UserDonorProfile;
}

export interface DemoAccount {
  role: string;
  email: string;
  fullName: string;
  title: string;
  district: string;
  nic: string;
  badge: string;
  description: string;
}