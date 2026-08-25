export type DocumentType = 'NIC' | 'MedicalCertificate' | 'HospitalLicense';

export interface UploadedDocumentResult {
  id: string;
  publicUrl: string;
}