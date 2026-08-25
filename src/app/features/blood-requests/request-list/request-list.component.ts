import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodRequestSummary } from '../../../core/models/blood-request.models';
import { formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [RouterLink, NgClass, DatePipe],
  templateUrl: './request-list.component.html'
})
export class RequestListComponent implements OnInit {
  requests = signal<BloodRequestSummary[]>([]);
  loading = signal(true);
  formatBloodType = formatBloodType;

  urgencyStyles: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700',
    Urgent: 'bg-orange-100 text-orange-700',
    Routine: 'bg-blue-100 text-blue-700'
  };

  constructor(private bloodRequestService: BloodRequestService) {}

  ngOnInit(): void {
    this.bloodRequestService.getOpen().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}