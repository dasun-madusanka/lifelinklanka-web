import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { BloodRequestSummary } from '../../../core/models/blood-request.models';
import { AuthService } from '../../../core/services/auth.service';
import { formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './request-detail.component.html'
})
export class RequestDetailComponent implements OnInit {
  request = signal<BloodRequestSummary | null>(null);
  loading = signal(true);
  responded = signal(false);
  formatBloodType = formatBloodType;

  constructor(
    private route: ActivatedRoute,
    private bloodRequestService: BloodRequestService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
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
    });
  }
}