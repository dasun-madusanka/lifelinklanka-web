import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { BloodRequestSummary, formatComponentType } from '../../../core/models/blood-request.models';
import { formatBloodType, BLOOD_TYPES } from '../../../core/models/donor.models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './request-list.component.html'
})
export class RequestListComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;
  formatComponentType = formatComponentType;

  requests = signal<BloodRequestSummary[]>([]);
  loading = signal(true);

  // Filters
  selectedDistrict = '';
  selectedUrgency = '';
  selectedBloodType = '';

  districts = [
    'All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kurunegala', 'Anuradhapura', 'Badulla'
  ];

  constructor(
    private bloodRequestService: BloodRequestService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.bloodRequestService.getOpen(
      this.selectedDistrict && this.selectedDistrict !== 'All Districts' ? this.selectedDistrict : undefined,
      this.selectedUrgency || undefined,
      this.selectedBloodType || undefined
    ).subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}