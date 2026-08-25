export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  nicNumber: string;
  district: string;
  dateOfBirth: string; // ISO date string
  role: string;
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