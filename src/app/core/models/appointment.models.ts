import { BloodType } from './donor.models';

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

export interface DonationAppointment {
  id: string;
  donorUserId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodType: BloodType;
  bloodBankId?: string;
  bloodBankName?: string;
  bloodCampId?: string;
  bloodCampTitle?: string;
  scheduledSlotUtc: string;
  status: AppointmentStatus | number;
  preScreeningPassed: boolean;
  notes?: string;
  createdAtUtc: string;
}

export interface BookAppointmentDto {
  bloodBankId?: string;
  bloodCampId?: string;
  scheduledSlotUtc: string;
  preScreeningPassed: boolean;
  preScreeningAnswersJson?: string;
  notes?: string;
}

export interface PreScreeningQuestion {
  id: number;
  question: string;
  category: string;
  disqualifyingIfYes: boolean;
  hint: string;
}
