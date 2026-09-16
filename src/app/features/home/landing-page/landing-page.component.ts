import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CampService } from '../../../core/services/camp.service';
import { BloodRequestService } from '../../../core/services/blood-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { NationalDashboardStats } from '../../../core/models/analytics.models';
import { BloodCamp } from '../../../core/models/camp.models';
import { BloodRequestSummary, formatComponentType } from '../../../core/models/blood-request.models';
import { BloodType, BLOOD_TYPES, formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  @ViewChild('heroVideo') heroVideoRef?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    if (this.heroVideoRef?.nativeElement) {
      const v = this.heroVideoRef.nativeElement;
      v.muted = true;
      v.play().catch(err => console.log('Autoplay handled:', err));
    }
  }

  bloodTypes = BLOOD_TYPES;
  formatBloodType = formatBloodType;
  formatComponentType = formatComponentType;

  // Real-time Data Signals
  stats = signal<NationalDashboardStats | null>(null);
  urgentRequests = signal<BloodRequestSummary[]>([]);
  upcomingCamps = signal<BloodCamp[]>([]);
  loading = signal(true);

  // Interactive Blood Matrix Signals
  selectedBloodType = signal<BloodType>('OPositive');
  matrixMode = signal<'give' | 'receive'>('give');

  // Interactive Donor Screening Quiz
  quizStarted = signal(false);
  currentQuestionIndex = signal(0);
  quizCompleted = signal(false);
  quizPassed = signal(true);
  disqualificationReason = signal<string | null>(null);

  // Interactive Media Carousel & Background Video
  activeMediaTab = signal<'lab' | 'transfusion' | 'coldchain'>('lab');
  videoPlaying = signal(true);

  toggleVideo(videoEl: HTMLVideoElement): void {
    if (videoEl.paused) {
      videoEl.play();
      this.videoPlaying.set(true);
    } else {
      videoEl.pause();
      this.videoPlaying.set(false);
    }
  }

  // Quick RSVP / Pledge Modal for Blood Camps
  pledgeModalOpen = signal(false);
  selectedCamp = signal<BloodCamp | null>(null);
  pledgeName = '';
  pledgePhone = '';
  pledgeBloodType: BloodType = 'OPositive';
  pledgeSuccess = signal(false);

  // Sri Lanka 10-Question National Screening Checklist
  quizQuestions = [
    {
      id: 1,
      q: 'Are you feeling healthy, well, and free of cold/fever today?',
      disqualifyIf: false,
      reason: 'Donors must be in good general health on donation day.'
    },
    {
      id: 2,
      q: 'Are you between 18 and 60 years old?',
      disqualifyIf: false,
      reason: 'First-time donors must be 18–60 years old per clinical safety guidelines.'
    },
    {
      id: 3,
      q: 'Do you weigh at least 45 kg (or 50 kg for platelets)?',
      disqualifyIf: false,
      reason: 'Minimum body weight is 45 kg for safe donation.'
    },
    {
      id: 4,
      q: 'Have you donated blood within the last 120 days (4 months)?',
      disqualifyIf: true,
      reason: 'Clinical standards require a mandatory 120-day interval between donations for cellular regeneration.'
    },
    {
      id: 5,
      q: 'Have you had a tattoo or body piercing in the past 6 months?',
      disqualifyIf: true,
      reason: 'A 6-month safety deferral applies to ensure zero transfusion-transmitted infection risk.'
    },
    {
      id: 6,
      q: 'Have you had major surgery or a blood transfusion in the past 12 months?',
      disqualifyIf: true,
      reason: 'A 12-month deferral window is required following major surgery or transfusion.'
    },
    {
      id: 7,
      q: 'Are you currently taking antibiotics or heart medications?',
      disqualifyIf: true,
      reason: 'Active medication courses require complete recovery and clearance.'
    },
    {
      id: 8,
      q: 'For female donors: Are you currently pregnant or nursing?',
      disqualifyIf: true,
      reason: 'Pregnancy and lactation require temporary deferral for mother and child health.'
    }
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private campService: CampService,
    private requestService: BloodRequestService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.analyticsService.getDashboardStats().subscribe({
      next: data => this.stats.set(data),
      error: () => {}
    });

    this.requestService.getOpenRequests().subscribe({
      next: reqs => this.urgentRequests.set(reqs.slice(0, 4)),
      error: () => {}
    });

    this.campService.getAllCamps().subscribe({
      next: camps => {
        this.upcomingCamps.set(camps.slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // Compatibility Checker Calculations
  setBloodType(type: BloodType): void {
    this.selectedBloodType.set(type);
  }

  setMatrixMode(mode: 'give' | 'receive'): void {
    this.matrixMode.set(mode);
  }

  isCompatibleWith(targetType: BloodType): boolean {
    const selected = this.selectedBloodType();
    const mode = this.matrixMode();

    if (mode === 'give') {
      // Who can 'selected' donate Red Cells to?
      switch (selected) {
        case 'ONegative': return true;
        case 'OPositive': return ['OPositive', 'APositive', 'BPositive', 'ABPositive'].includes(targetType);
        case 'ANegative': return ['ANegative', 'APositive', 'ABNegative', 'ABPositive'].includes(targetType);
        case 'APositive': return ['APositive', 'ABPositive'].includes(targetType);
        case 'BNegative': return ['BNegative', 'BPositive', 'ABNegative', 'ABPositive'].includes(targetType);
        case 'BPositive': return ['BPositive', 'ABPositive'].includes(targetType);
        case 'ABNegative': return ['ABNegative', 'ABPositive'].includes(targetType);
        case 'ABPositive': return targetType === 'ABPositive';
      }
    } else {
      // Who can 'selected' receive Red Cells from?
      switch (selected) {
        case 'ABPositive': return true;
        case 'ABNegative': return ['ABNegative', 'ANegative', 'BNegative', 'ONegative'].includes(targetType);
        case 'APositive': return ['APositive', 'ANegative', 'OPositive', 'ONegative'].includes(targetType);
        case 'ANegative': return ['ANegative', 'ONegative'].includes(targetType);
        case 'BPositive': return ['BPositive', 'BNegative', 'OPositive', 'ONegative'].includes(targetType);
        case 'BNegative': return ['BNegative', 'ONegative'].includes(targetType);
        case 'OPositive': return ['OPositive', 'ONegative'].includes(targetType);
        case 'ONegative': return targetType === 'ONegative';
      }
    }
    return false;
  }

  // Quiz Methods
  startQuiz(): void {
    this.quizStarted.set(true);
    this.currentQuestionIndex.set(0);
    this.quizCompleted.set(false);
    this.quizPassed.set(true);
    this.disqualificationReason.set(null);
  }

  answerQuestion(answer: boolean): void {
    const q = this.quizQuestions[this.currentQuestionIndex()];
    if (answer === q.disqualifyIf) {
      this.quizPassed.set(false);
      this.disqualificationReason.set(q.reason);
      this.quizCompleted.set(true);
      return;
    }

    if (this.currentQuestionIndex() < this.quizQuestions.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.quizPassed.set(true);
      this.quizCompleted.set(true);
    }
  }

  resetQuiz(): void {
    this.quizStarted.set(false);
    this.quizCompleted.set(false);
    this.quizPassed.set(true);
  }

  // Camp Pledge Modal
  openPledgeModal(camp: BloodCamp): void {
    this.selectedCamp.set(camp);
    this.pledgeModalOpen.set(true);
    this.pledgeSuccess.set(false);
    if (this.auth.isLoggedIn()) {
      this.pledgeName = this.auth.currentUser()?.fullName ?? '';
    }
  }

  closePledgeModal(): void {
    this.pledgeModalOpen.set(false);
    this.selectedCamp.set(null);
  }

  submitPledge(): void {
    const camp = this.selectedCamp();
    if (!camp || !this.pledgeName || !this.pledgePhone) return;

    this.campService.registerForCamp(camp.id, {
      donorName: this.pledgeName,
      contactPhone: this.pledgePhone,
      bloodTypePledged: this.pledgeBloodType
    }).subscribe({
      next: () => {
        this.pledgeSuccess.set(true);
        setTimeout(() => this.closePledgeModal(), 2000);
      }
    });
  }

  setMediaTab(tab: 'lab' | 'transfusion' | 'coldchain'): void {
    this.activeMediaTab.set(tab);
  }
}
