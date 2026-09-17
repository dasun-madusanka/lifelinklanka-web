import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BLOOD_TYPES, formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  selectedRole = signal<'Donor' | 'HospitalStaff' | 'BloodBank'>('Donor');

  // Common identity
  fullName = '';
  email = '';
  password = '';
  showPassword = signal(false);
  nicNumber = '';
  district = 'Colombo';
  dateOfBirth = '';
  phoneNumber = '';

  // Donor-specific
  bloodType = 'OPositive';
  weightKg = 60;
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;

  // Hospital-specific
  hospitalName = '';
  hospitalRegistrationNumber = '';
  hospitalDistrict = 'Colombo';
  hospitalAddress = '';
  hospitalContactPhone = '';

  // Blood Bank-specific
  bloodBankName = '';
  bloodBankDistrict = 'Colombo';
  bloodBankAddress = '';
  bloodBankContactPhone = '';

  // Mandatory Verification Document
  selectedFile: File | null = null;
  selectedFileName = signal<string | null>(null);
  selectedFileSize = signal<string | null>(null);
  fileError = signal<string | null>(null);

  districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  selectRole(role: 'Donor' | 'HospitalStaff' | 'BloodBank'): void {
    this.selectedRole.set(role);
    this.errorMessage.set(null);
  }

  onFileSelected(event: any): void {
    this.fileError.set(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      this.fileError.set('Unsupported file format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.fileError.set('File exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    this.selectedFile = file;
    this.selectedFileName.set(file.name);
    this.selectedFileSize.set((file.size / 1024 / 1024).toFixed(2) + ' MB');
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName.set(null);
    this.selectedFileSize.set(null);
    this.fileError.set(null);
  }

  get docRequiredTitle(): string {
    const role = this.selectedRole();
    if (role === 'Donor') return 'Medical Fitness Certificate / Diagnostic Report';
    if (role === 'HospitalStaff') return 'Hospital Appointment Letter / Medical Staff Verification ID';
    return 'Blood Bank Transfusion License / Official MOH Facility Certification';
  }

  get docRequiredType(): string {
    const role = this.selectedRole();
    if (role === 'Donor') return 'MedicalCertificate';
    if (role === 'HospitalStaff') return 'HospitalLicense';
    return 'BloodBankLicense';
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.fileError.set(null);

    // Mandatory document check
    if (!this.selectedFile) {
      this.errorMessage.set(`Document Upload Required: Please attach your ${this.docRequiredTitle} to proceed with verification.`);
      return;
    }

    this.loading.set(true);

    const role = this.selectedRole();
    const docType = this.docRequiredType;

    // First upload the verification document
    this.auth.uploadVerificationDoc(this.selectedFile, docType).subscribe({
      next: (uploadRes) => {
        // Construct registration payload with document details
        const payload: any = {
          fullName: this.fullName,
          email: this.email,
          password: this.password,
          nicNumber: this.nicNumber,
          district: this.district,
          dateOfBirth: this.dateOfBirth,
          phoneNumber: this.phoneNumber,
          role: role,
          verificationDocumentUrl: uploadRes.documentUrl,
          verificationDocumentName: uploadRes.fileName,
          verificationDocumentType: uploadRes.documentType
        };

        if (role === 'Donor') {
          payload.bloodType = this.bloodType;
          payload.weightKg = this.weightKg;
        } else if (role === 'HospitalStaff') {
          payload.hospitalName = this.hospitalName || `${this.fullName}'s Healthcare Center`;
          payload.hospitalRegistrationNumber = this.hospitalRegistrationNumber;
          payload.hospitalDistrict = this.hospitalDistrict || this.district;
          payload.hospitalAddress = this.hospitalAddress;
          payload.hospitalContactPhone = this.hospitalContactPhone || this.phoneNumber;
        } else if (role === 'BloodBank') {
          payload.bloodBankName = this.bloodBankName || `${this.district} Transfusion Center`;
          payload.bloodBankDistrict = this.bloodBankDistrict || this.district;
          payload.bloodBankAddress = this.bloodBankAddress;
          payload.bloodBankContactPhone = this.bloodBankContactPhone || this.phoneNumber;
        }

        this.auth.register(payload).subscribe({
          next: (res) => {
            this.loading.set(false);
            this.successMessage.set(res.message);
            setTimeout(() => this.router.navigate(['/login']), 4000);
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(this.extractError(err));
          }
        });
      },
      error: (uploadErr) => {
        this.loading.set(false);
        this.errorMessage.set(uploadErr.error?.message ?? 'Failed to upload verification document. Please try again.');
      }
    });
  }

  private extractError(err: any): string {
    if (typeof err.error === 'string') return err.error;
    if (err.error?.message) return err.error.message;
    if (Array.isArray(err.error)) {
      return err.error.map((e: any) => e.description || e.message || JSON.stringify(e)).join(' ');
    }
    if (err.error?.errors) {
      const messages: string[] = [];
      for (const key of Object.keys(err.error.errors)) {
        messages.push(...err.error.errors[key]);
      }
      return messages.join(' ');
    }
    return 'Registration failed. Please check your details and try again.';
  }
}