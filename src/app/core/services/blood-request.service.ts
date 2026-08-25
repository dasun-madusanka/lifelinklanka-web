import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BloodRequestSummary, CreateBloodRequestDto } from '../models/blood-request.models';

@Injectable({ providedIn: 'root' })
export class BloodRequestService {
  private base = `${environment.apiUrl}/blood-requests`;

  constructor(private http: HttpClient) {}

  create(dto: CreateBloodRequestDto) {
    return this.http.post<BloodRequestSummary>(this.base, dto);
  }

  getOpen(district?: string) {
    let url = this.base;
    if (district) url += `?district=${encodeURIComponent(district)}`;
    return this.http.get<BloodRequestSummary[]>(url);
  }

  getById(id: string) {
    return this.http.get<BloodRequestSummary>(`${this.base}/${id}`);
  }

  respond(id: string, accept: boolean) {
    return this.http.post(`${this.base}/${id}/respond`, accept, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}