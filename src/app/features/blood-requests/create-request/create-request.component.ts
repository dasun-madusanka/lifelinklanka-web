import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { HospitalService } from '../../../core/services/hospital.service';
import { BLOOD_TYPES, BloodType, formatBloodType } from '../../../core/models/donor.models';
import { Hospital } from '../../../core/models/hospital.models';
import { UrgencyLevel, BloodComponentType, BLOOD_COMPONENTS, formatComponentType } from '../../../core/models/blood-request.models';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-request.component.html'
})
export class CreateRequestComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;
  components = BLOOD_COMPONENTS;
  formatComponentType = formatComponentType;
  urgencyLevels: UrgencyLevel[] = ['Critical', 'Urgent', 'Routine'];
  hospitals = signal<Hospital[]>([]);

  hospitalId = '';
  bloodTypeNeeded: BloodType = 'OPositive';
  componentNeeded: BloodComponentType = 'PackedRedBloodCells';
  unitsNeeded = 2;
  urgency: UrgencyLevel = 'Critical';
  patientContext = '';
  clinicalIndication = 'Emergency Trauma Surgery';
  neededByUtc = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16);

  commonIndications = [
    'Emergency Trauma Surgery',
    'Dengue Hemorrhagic Shock Syndrome',
    'Pediatric Oncology / Leukemia Chemotherapy',
    'Postpartum Hemorrhage (Obstetric Emergency)',
    'Cardiothoracic / Open Heart Surgery',
    'Thalassemia Major Transfusion',
    'Severe Anemia with Hemodynamic Instability'
  ];

  errorMessage = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private bloodRequestService: BloodRequestService,
    private hospitalService: HospitalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hospitalService.getAll().subscribe(hospitals => {
      this.hospitals.set(hospitals);
      if (hospitals.length > 0) {
        this.hospitalId = hospitals[0].id;
      }
    });
  }

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.bloodRequestService.create({
      hospitalId: this.hospitalId,
      bloodTypeNeeded: this.bloodTypeNeeded,
      componentNeeded: this.componentNeeded,
      unitsNeeded: this.unitsNeeded,
      urgency: this.urgency,
      patientContext: this.patientContext,
      clinicalIndication: this.clinicalIndication,
      neededByUtc: new Date(this.neededByUtc).toISOString()
    }).subscribe({
      next: (req) => {
        this.loading.set(false);
        this.router.navigate(['/blood-requests', req.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.title ?? 'Could not broadcast blood request. Verify hospital authorization.');
      }
    });
  }
}