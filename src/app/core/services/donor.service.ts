import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DonorMatch, DonorProfile, UpsertDonorProfileDto } from '../models/donor.models';

@Injectable({ providedIn: 'root' })
export class DonorService {
  private base = `${environment.apiUrl}/donors`;

  constructor(private http: HttpClient) {}

  upsertProfile(dto: UpsertDonorProfileDto) {
    return this.http.put<DonorProfile>(`${this.base}/profile`, dto);
  }

  getMyProfile() {
    return this.http.get<DonorProfile>(`${this.base}/profile`);
  }

  recalculateEligibility() {
    return this.http.post<{ isEligibleToDonate: boolean; lastDonationDateUtc: string | null }>(
      `${this.base}/profile/recalculate-eligibility`, {}
    );
  }

  getMyMatches() {
    return this.http.get<DonorMatch[]>(`${this.base}/my-matches`);
  }
}