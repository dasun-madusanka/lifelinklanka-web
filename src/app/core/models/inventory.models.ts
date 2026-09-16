import { BloodType } from './donor.models';
import { BloodComponentType } from './blood-request.models';

export interface BloodInventoryItem {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  district: string;
  bloodType: BloodType;
  componentType: BloodComponentType;
  unitsAvailable: number;
  storageLocation: string;
  batchNumber: string;
  expiryDateUtc: string;
  status: 'Adequate' | 'Low' | 'Critical';
}

export interface BloodStockSummary {
  bloodType: BloodType;
  wholeBloodUnits: number;
  packedRbcUnits: number;
  plateletsUnits: number;
  plasmaUnits: number;
  totalUnits: number;
  statusAlert: 'Adequate' | 'Low' | 'Critical';
}

export interface AddInventoryDto {
  bloodBankId: string;
  bloodType: BloodType;
  componentType: BloodComponentType;
  units: number;
  storageLocation: string;
  batchNumber: string;
  expiryDateUtc: string;
}

export interface UpdateStockDto {
  unitsDelta: number;
  reason: string;
  notes?: string;
}
