import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateHospitalDto, Hospital } from '../models/hospital.models';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private base = `${environment.apiUrl}/hospitals`;

  constructor(private http: HttpClient) {}

  create(dto: CreateHospitalDto) {
    return this.http.post<Hospital>(this.base, dto);
  }

  getById(id: string) {
    return this.http.get<Hospital>(`${this.base}/${id}`);
  }

  getAll(district?: string) {
    let url = this.base;
    if (district) url += `?district=${encodeURIComponent(district)}`;
    return this.http.get<Hospital[]>(url);
  }
}