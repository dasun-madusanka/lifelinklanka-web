import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BloodBank, CreateBloodBankDto } from '../models/blood-bank.models';

@Injectable({ providedIn: 'root' })
export class BloodBankService {
  private base = `${environment.apiUrl}/blood-banks`;

  constructor(private http: HttpClient) {}

  create(dto: CreateBloodBankDto) {
    return this.http.post<BloodBank>(this.base, dto);
  }

  getAll(district?: string) {
    let url = this.base;
    if (district) url += `?district=${encodeURIComponent(district)}`;
    return this.http.get<BloodBank[]>(url);
  }

  recordDonation(bankId: string, donorUserId: string, volumeMl = 450) {
    const url = `${this.base}/${bankId}/record-donation?donorUserId=${donorUserId}&volumeMl=${volumeMl}`;
    return this.http.post(url, {});
  }
}