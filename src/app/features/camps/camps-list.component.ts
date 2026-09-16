import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampService } from '../../core/services/camp.service';
import { AuthService } from '../../core/services/auth.service';
import { BloodCamp, CreateBloodCampDto, CampRegistration } from '../../core/models/camp.models';
import { BloodType, BLOOD_TYPES, formatBloodType } from '../../core/models/donor.models';

@Component({
  selector: 'app-camps-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './camps-list.component.html'
})
export class CampsListComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;

  camps = signal<BloodCamp[]>([]);
  loading = signal(true);

  // Filters
  selectedDistrict = '';
  selectedStatus = '';

  // Host Camp Modal
  showCreateModal = signal(false);
  newCamp: CreateBloodCampDto = {
    title: '',
    organizerName: '',
    district: 'Colombo',
    venueAddress: '',
    startDateUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    endDateUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString().slice(0, 16),
    targetUnits: 150,
    contactPhone: '',
    specialInstructions: 'Refreshments and certificates will be provided.'
  };

  // Edit Camp Modal
  showEditModal = signal(false);
  editingCampId = '';
  editCampData: CreateBloodCampDto = {
    title: '',
    organizerName: '',
    district: 'Colombo',
    venueAddress: '',
    startDateUtc: '',
    endDateUtc: '',
    targetUnits: 100,
    contactPhone: '',
    specialInstructions: ''
  };

  // View Registrations Modal
  showRegistrationsModal = signal(false);
  activeRegistrationsCamp = signal<BloodCamp | null>(null);
  registrations = signal<CampRegistration[]>([]);
  loadingRegistrations = signal(false);

  // Pledge Modal
  showPledgeModal = signal(false);
  activeCamp = signal<BloodCamp | null>(null);
  pledgeName = '';
  pledgePhone = '';
  pledgeBloodType: BloodType = 'OPositive';
  pledgeDone = signal(false);

  districts = [
    'All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kurunegala', 'Anuradhapura', 'Badulla'
  ];

  constructor(
    private campService: CampService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCamps();
  }

  loadCamps(): void {
    this.loading.set(true);
    this.campService.getAllCamps(
      this.selectedDistrict && this.selectedDistrict !== 'All Districts' ? this.selectedDistrict : undefined,
      this.selectedStatus || undefined
    ).subscribe({
      next: data => {
        this.camps.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateCamp(): void {
    this.campService.createCamp(this.newCamp).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadCamps();
      }
    });
  }

  openEditModal(camp: BloodCamp): void {
    this.editingCampId = camp.id;
    this.editCampData = {
      title: camp.title,
      organizerName: camp.organizerName,
      district: camp.district,
      venueAddress: camp.venueAddress,
      startDateUtc: new Date(camp.startDateUtc).toISOString().slice(0, 16),
      endDateUtc: new Date(camp.endDateUtc).toISOString().slice(0, 16),
      targetUnits: camp.targetUnits,
      contactPhone: camp.contactPhone,
      specialInstructions: camp.specialInstructions || ''
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  submitUpdateCamp(): void {
    if (!this.editingCampId) return;
    this.campService.updateCamp(this.editingCampId, this.editCampData).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadCamps();
      }
    });
  }

  deleteCamp(camp: BloodCamp): void {
    if (!confirm(`Are you sure you want to delete blood camp "${camp.title}"?`)) return;
    this.campService.deleteCamp(camp.id).subscribe({
      next: () => this.loadCamps()
    });
  }

  openRegistrations(camp: BloodCamp): void {
    this.activeRegistrationsCamp.set(camp);
    this.showRegistrationsModal.set(true);
    this.loadingRegistrations.set(true);
    this.campService.getRegistrations(camp.id).subscribe({
      next: regs => {
        this.registrations.set(regs);
        this.loadingRegistrations.set(false);
      },
      error: () => this.loadingRegistrations.set(false)
    });
  }

  closeRegistrations(): void {
    this.showRegistrationsModal.set(false);
    this.activeRegistrationsCamp.set(null);
  }

  openPledgeModal(camp: BloodCamp): void {
    this.activeCamp.set(camp);
    this.showPledgeModal.set(true);
    this.pledgeDone.set(false);
    if (this.auth.isLoggedIn()) {
      this.pledgeName = this.auth.currentUser()?.fullName ?? '';
    }
  }

  closePledgeModal(): void {
    this.showPledgeModal.set(false);
    this.activeCamp.set(null);
  }

  submitPledge(): void {
    const camp = this.activeCamp();
    if (!camp) return;

    this.campService.registerForCamp(camp.id, {
      donorName: this.pledgeName,
      contactPhone: this.pledgePhone,
      bloodTypePledged: this.pledgeBloodType
    }).subscribe({
      next: () => {
        this.pledgeDone.set(true);
        setTimeout(() => {
          this.closePledgeModal();
          this.loadCamps();
        }, 1800);
      }
    });
  }
}
