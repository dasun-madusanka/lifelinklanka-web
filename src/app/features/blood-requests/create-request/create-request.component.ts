import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { HospitalService } from '../../../core/services/hospital.service';
import { BLOOD_TYPES, BloodType, formatBloodType } from '../../../core/models/donor.models';
import { Hospital } from '../../../core/models/hospital.models';
import { UrgencyLevel } from '../../../core/models/blood-request.models';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-request.component.html'
})
export class CreateRequestComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;
  urgencyLevels: UrgencyLevel[] = ['Routine', 'Urgent', 'Critical'];
  hospitals = signal<Hospital[]>([]);

  hospitalId = '';
  bloodTypeNeeded: BloodType = 'OPositive';
  unitsNeeded = 2;
  urgency: UrgencyLevel = 'Urgent';
  patientContext = '';
  neededByUtc = '';

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private bloodRequestService: BloodRequestService,
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hospitalService.getAll().subscribe(hospitals => this.hospitals.set(hospitals));
  }

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bloodRequestService.create({
      hospitalId: this.hospitalId,
      bloodTypeNeeded: this.bloodTypeNeeded,
      unitsNeeded: this.unitsNeeded,
      urgency: this.urgency,
      patientContext: this.patientContext,
      neededByUtc: new Date(this.neededByUtc).toISOString()
    }).subscribe({
      next: (req) => {
        this.loading.set(false);
        this.router.navigate(['/blood-requests', req.id]);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not create request. Make sure the hospital is verified.');
      }
    });
  }
}