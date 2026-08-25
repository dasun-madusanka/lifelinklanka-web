import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DocumentType, UploadedDocumentResult } from '../models/document.models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private base = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  upload(file: File, documentType: DocumentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<UploadedDocumentResult>(`${this.base}/upload`, formData);
  }
}