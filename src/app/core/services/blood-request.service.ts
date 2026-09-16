import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodRequestSummary, CreateBloodRequestDto, UpdateBloodRequestDto } from '../models/blood-request.models';

@Injectable({ providedIn: 'root' })
export class BloodRequestService {
  private base = `${environment.apiUrl}/blood-requests`;

  constructor(private http: HttpClient) {}

  create(dto: CreateBloodRequestDto): Observable<BloodRequestSummary> {
    return this.http.post<BloodRequestSummary>(this.base, dto);
  }

  getOpen(district?: string, urgency?: string, bloodType?: string): Observable<BloodRequestSummary[]> {
    let params = new HttpParams();
    if (district) params = params.set('district', district);
    if (urgency) params = params.set('urgency', urgency);
    if (bloodType) params = params.set('bloodType', bloodType);

    return this.http.get<BloodRequestSummary[]>(this.base, { params });
  }

  getOpenRequests(district?: string, urgency?: string, bloodType?: string): Observable<BloodRequestSummary[]> {
    return this.getOpen(district, urgency, bloodType);
  }

  getById(id: string): Observable<BloodRequestSummary> {
    return this.http.get<BloodRequestSummary>(`${this.base}/${id}`);
  }

  update(id: string, dto: UpdateBloodRequestDto): Observable<BloodRequestSummary> {
    return this.http.put<BloodRequestSummary>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  respond(id: string, accept: boolean): Observable<any> {
    return this.http.post(`${this.base}/${id}/respond`, accept, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}