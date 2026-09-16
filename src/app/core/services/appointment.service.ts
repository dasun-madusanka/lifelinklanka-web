import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DonationAppointment, BookAppointmentDto, PreScreeningQuestion } from '../models/appointment.models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private base = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  getMyAppointments(): Observable<DonationAppointment[]> {
    return this.http.get<DonationAppointment[]>(`${this.base}/my`);
  }

  bookAppointment(dto: BookAppointmentDto): Observable<any> {
    return this.http.post(this.base, dto);
  }

  cancelAppointment(id: string): Observable<any> {
    return this.http.put(`${this.base}/${id}/cancel`, {});
  }

  getScreeningQuestions(): Observable<PreScreeningQuestion[]> {
    return this.http.get<PreScreeningQuestion[]>(`${this.base}/screening-questions`);
  }

  getAllAppointments(bloodBankId?: string): Observable<DonationAppointment[]> {
    let url = this.base;
    if (bloodBankId) url += `?bloodBankId=${bloodBankId}`;
    return this.http.get<DonationAppointment[]>(url);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.base}/${id}/status?status=${encodeURIComponent(status)}`, {});
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
