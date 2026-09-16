import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { BloodBankService } from '../../core/services/blood-bank.service';
import { CampService } from '../../core/services/camp.service';
import { AuthService } from '../../core/services/auth.service';
import { DonationAppointment, BookAppointmentDto, PreScreeningQuestion } from '../../core/models/appointment.models';
import { BloodBank } from '../../core/models/blood-bank.models';
import { BloodCamp } from '../../core/models/camp.models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './appointments.component.html'
})
export class AppointmentsComponent implements OnInit {
  appointments = signal<DonationAppointment[]>([]);
  bloodBanks = signal<BloodBank[]>([]);
  camps = signal<BloodCamp[]>([]);
  questions = signal<PreScreeningQuestion[]>([]);
  loading = signal(true);

  // Booking Form
  bookingMode = signal<'bank' | 'camp'>('bank');
  selectedBankId = '';
  selectedCampId = '';
  scheduledSlot = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  donorNotes = '';

  // Screening Checklist Answers (keyed by question id)
  answers: Record<number, boolean> = {};
  showBookingModal = signal(false);
  bookingSuccess = signal(false);
  screeningFailed = signal(false);

  constructor(
    private apptService: AppointmentService,
    private bankService: BloodBankService,
    private campService: CampService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    const isOfficerOrAdmin = this.auth.hasRole('BloodBank') || this.auth.hasRole('Admin');
    const appts$ = isOfficerOrAdmin
      ? this.apptService.getAllAppointments()
      : this.apptService.getMyAppointments();

    appts$.subscribe({
      next: appts => {
        this.appointments.set(appts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.bankService.getAll().subscribe({
      next: banks => {
        this.bloodBanks.set(banks);
        if (banks.length > 0 && !this.selectedBankId) {
          this.selectedBankId = banks[0].id;
        }
      }
    });

    this.campService.getAllCamps().subscribe({
      next: camps => {
        this.camps.set(camps);
        if (camps.length > 0 && !this.selectedCampId) {
          this.selectedCampId = camps[0].id;
        }
      }
    });

    this.apptService.getScreeningQuestions().subscribe({
      next: qs => {
        this.questions.set(qs);
        // Default all to healthy answers
        qs.forEach(q => {
          this.answers[q.id] = q.disqualifyingIfYes ? false : true;
        });
      }
    });
  }

  openBookingModal(): void {
    this.showBookingModal.set(true);
    this.bookingSuccess.set(false);
    this.screeningFailed.set(false);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
  }

  validateScreening(): boolean {
    const qs = this.questions();
    for (const q of qs) {
      const userAns = this.answers[q.id];
      if (q.disqualifyingIfYes && userAns === true) return false;
      if (!q.disqualifyingIfYes && userAns === false) return false;
    }
    return true;
  }

  submitBooking(): void {
    const passed = this.validateScreening();
    if (!passed) {
      this.screeningFailed.set(true);
      return;
    }

    const dto: BookAppointmentDto = {
      bloodBankId: this.bookingMode() === 'bank' ? this.selectedBankId : undefined,
      bloodCampId: this.bookingMode() === 'camp' ? this.selectedCampId : undefined,
      scheduledSlotUtc: new Date(this.scheduledSlot).toISOString(),
      preScreeningPassed: true,
      notes: this.donorNotes
    };

    this.apptService.bookAppointment(dto).subscribe({
      next: () => {
        this.bookingSuccess.set(true);
        setTimeout(() => {
          this.closeBookingModal();
          this.loadData();
        }, 1800);
      }
    });
  }

  updateStatus(id: string, status: string): void {
    this.apptService.updateStatus(id, status).subscribe({
      next: () => this.loadData()
    });
  }

  cancelAppointment(id: string): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    this.apptService.cancelAppointment(id).subscribe({
      next: () => this.loadData()
    });
  }

  deleteAppointment(id: string): void {
    if (!confirm('Are you sure you want to delete this appointment record?')) return;
    this.apptService.deleteAppointment(id).subscribe({
      next: () => this.loadData()
    });
  }
}
