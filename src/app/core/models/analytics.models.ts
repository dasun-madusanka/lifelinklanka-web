import { BloodType } from './donor.models';

export interface NationalDashboardStats {
  totalDonors: number;
  totalHospitals: number;
  totalBloodBanks: number;
  activeCamps: number;
  totalUnitsAvailable: number;
  criticalRequestsCount: number;
  totalDonationsCompleted: number;
  estimatedLivesSaved: number;
}

export interface BloodTypeDistribution {
  bloodType: BloodType;
  bloodTypeName: string;
  availableUnits: number;
  percentageOfTotal: number;
}

export interface MonthlyDonationTrend {
  monthName: string;
  year: number;
  donationCount: number;
  unitsCollected: number;
}

export interface DistrictDemandSummary {
  district: string;
  activeRequests: number;
  unitsNeeded: number;
  registeredDonors: number;
  availableStockUnits: number;
  urgencyRating: 'Normal' | 'Moderate' | 'Urgent' | 'Critical';
}
