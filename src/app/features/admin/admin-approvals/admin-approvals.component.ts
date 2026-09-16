import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { PendingUserApproval } from '../../../core/models/admin.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-approvals.component.html'
})
export class AdminApprovalsComponent implements OnInit {
  pendingList = signal<PendingUserApproval[]>([]);
  loading = signal(true);
  selectedFilter = signal<'ALL' | 'Donor' | 'HospitalStaff' | 'BloodBank'>('ALL');
  
  // Action feedback
  actionMessage = signal<string | null>(null);
  actionError = signal<string | null>(null);

  // Document preview modal
  previewDoc = signal<{ url: string; name: string; type?: string } | null>(null);

  // Rejection modal
  rejectingUser = signal<PendingUserApproval | null>(null);
  rejectionReason = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.actionMessage.set(null);
    this.actionError.set(null);
    this.adminService.getPendingApprovals().subscribe({
      next: (data) => {
        this.pendingList.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.actionError.set(err.error?.message ?? 'Failed to load pending registrations.');
      }
    });
  }

  get filteredList(): PendingUserApproval[] {
    const filter = this.selectedFilter();
    if (filter === 'ALL') return this.pendingList();
    return this.pendingList().filter(u => u.role.toLowerCase() === filter.toLowerCase());
  }

  get donorCount(): number {
    return this.pendingList().filter(u => u.role.toLowerCase() === 'donor').length;
  }

  get hospitalCount(): number {
    return this.pendingList().filter(u => u.role.toLowerCase() === 'hospitalstaff').length;
  }

  get bloodBankCount(): number {
    return this.pendingList().filter(u => u.role.toLowerCase() === 'bloodbank').length;
  }

  approve(user: PendingUserApproval): void {
    this.actionMessage.set(null);
    this.actionError.set(null);

    this.adminService.approveUser(user.id).subscribe({
      next: (res) => {
        this.actionMessage.set(res.message);
        this.pendingList.set(this.pendingList().filter(u => u.id !== user.id));
      },
      error: (err) => {
        this.actionError.set(err.error?.message ?? 'Failed to approve application.');
      }
    });
  }

  openRejectModal(user: PendingUserApproval): void {
    this.rejectingUser.set(user);
    this.rejectionReason = '';
  }

  closeRejectModal(): void {
    this.rejectingUser.set(null);
    this.rejectionReason = '';
  }

  confirmReject(): void {
    const user = this.rejectingUser();
    if (!user) return;

    this.adminService.rejectUser(user.id, this.rejectionReason).subscribe({
      next: (res) => {
        this.actionMessage.set(res.message);
        this.pendingList.set(this.pendingList().filter(u => u.id !== user.id));
        this.closeRejectModal();
      },
      error: (err) => {
        this.actionError.set(err.error?.message ?? 'Failed to reject application.');
      }
    });
  }

  openDocPreview(docUrl: string | undefined, docName: string | undefined, docType: string | undefined): void {
    if (!docUrl) return;
    const fullUrl = docUrl.startsWith('http') ? docUrl : `${environment.apiUrl.replace('/api/v1', '')}${docUrl}`;
    this.previewDoc.set({ url: fullUrl, name: docName ?? 'Document', type: docType });
  }

  closeDocPreview(): void {
    this.previewDoc.set(null);
  }

  isPdf(url: string | undefined): boolean {
    return !!url && url.toLowerCase().includes('.pdf');
  }
}
