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

  findDonor(query: string) {
    return this.http.get<any>(`${this.base}/find-donor?query=${encodeURIComponent(query)}`);
  }

  update(id: string, dto: CreateBloodBankDto) {
    return this.http.put<BloodBank>(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  deleteDonation(id: string) {
    return this.http.delete<void>(`${this.base}/donations/${id}`);
  }
}