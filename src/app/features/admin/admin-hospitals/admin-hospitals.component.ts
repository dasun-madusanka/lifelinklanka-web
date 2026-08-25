import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Hospital } from '../../../core/models/hospital.models';

@Component({
  selector: 'app-admin-hospitals',
  standalone: true,
  templateUrl: './admin-hospitals.component.html'
})
export class AdminHospitalsComponent implements OnInit {
  pendingHospitals = signal<Hospital[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.adminService.getPendingHospitals().subscribe(hospitals => this.pendingHospitals.set(hospitals));
  }

  verify(id: string, approve: boolean): void {
    this.adminService.verifyHospital(id, approve).subscribe(() => this.loadPending());
  }
}