import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentType } from '../../../core/models/document.models';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  documentType: DocumentType = 'NIC';
  selectedFile: File | null = null;

  publicUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(private documentService: DocumentService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.errorMessage.set('Please choose a file first.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.documentService.upload(this.selectedFile, this.documentType).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.publicUrl.set(res.publicUrl);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Upload failed. Make sure the file is a PDF, JPEG, or PNG under 10MB.');
      }
    });
  }
}