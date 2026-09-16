import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodRequestSummary, RequestStatus, formatComponentType } from '../../../core/models/blood-request.models';
import { AuthService } from '../../../core/services/auth.service';
import { formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './request-detail.component.html'
})
export class RequestDetailComponent implements OnInit {
  request = signal<BloodRequestSummary | null>(null);
  loading = signal(true);
  responded = signal(false);
  acceptPledge = signal(false);
  formatBloodType = formatBloodType;
  formatComponentType = formatComponentType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bloodRequestService: BloodRequestService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequest();
  }

  loadRequest(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.bloodRequestService.getById(id).subscribe({
      next: (req) => {
        this.request.set(req);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  respond(accept: boolean): void {
    const id = this.request()!.id;
    this.bloodRequestService.respond(id, accept).subscribe(() => {
      this.responded.set(true);
      this.acceptPledge.set(accept);
      if (accept) {
        this.request.update(r => r ? { ...r, unitsFulfilled: r.unitsFulfilled + 1 } : null);
      }
    });
  }

  updateStatus(status: RequestStatus): void {
    const id = this.request()!.id;
    this.bloodRequestService.update(id, { status }).subscribe({
      next: (updated) => {
        this.request.set(updated);
      }
    });
  }

  deleteRequest(): void {
    if (!confirm('Are you sure you want to delete/cancel this blood request?')) return;
    const id = this.request()!.id;
    this.bloodRequestService.delete(id).subscribe({
      next: () => {
        this.router.navigate(['/blood-requests']);
      }
    });
  }
}