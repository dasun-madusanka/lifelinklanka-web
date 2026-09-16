import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodCamp, CreateBloodCampDto, RegisterCampDto, CampRegistration } from '../models/camp.models';

@Injectable({ providedIn: 'root' })
export class CampService {
  private base = `${environment.apiUrl}/camps`;

  constructor(private http: HttpClient) {}

  getAllCamps(district?: string, status?: string): Observable<BloodCamp[]> {
    let params = new HttpParams();
    if (district) params = params.set('district', district);
    if (status) params = params.set('status', status);

    return this.http.get<BloodCamp[]>(this.base, { params });
  }

  getById(id: string): Observable<BloodCamp> {
    return this.http.get<BloodCamp>(`${this.base}/${id}`);
  }

  createCamp(dto: CreateBloodCampDto): Observable<BloodCamp> {
    return this.http.post<BloodCamp>(this.base, dto);
  }

  registerForCamp(campId: string, dto: RegisterCampDto): Observable<any> {
    return this.http.post(`${this.base}/${campId}/register`, dto);
  }

  getRegistrations(campId: string): Observable<CampRegistration[]> {
    return this.http.get<CampRegistration[]>(`${this.base}/${campId}/registrations`);
  }

  updateCamp(id: string, dto: CreateBloodCampDto): Observable<BloodCamp> {
    return this.http.put<BloodCamp>(`${this.base}/${id}`, dto);
  }

  deleteCamp(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
