import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BloodInventoryItem, BloodStockSummary, AddInventoryDto, UpdateStockDto } from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private base = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getInventory(district?: string, bloodType?: string, componentType?: string): Observable<BloodInventoryItem[]> {
    let params = new HttpParams();
    if (district) params = params.set('district', district);
    if (bloodType) params = params.set('bloodType', bloodType);
    if (componentType) params = params.set('componentType', componentType);

    return this.http.get<BloodInventoryItem[]>(this.base, { params });
  }

  getStockSummary(): Observable<BloodStockSummary[]> {
    return this.http.get<BloodStockSummary[]>(`${this.base}/summary`);
  }

  addInventory(dto: AddInventoryDto): Observable<BloodInventoryItem> {
    return this.http.post<BloodInventoryItem>(this.base, dto);
  }

  updateStock(id: string, dto: UpdateStockDto): Observable<BloodInventoryItem> {
    return this.http.post<BloodInventoryItem>(`${this.base}/${id}/update-stock`, dto);
  }

  discardBatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
