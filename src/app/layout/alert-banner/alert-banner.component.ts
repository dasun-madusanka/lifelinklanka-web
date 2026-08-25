import { Component } from '@angular/core';
import { SignalrService } from '../../core/services/signalr.service';
import { formatBloodType } from '../../core/models/donor.models';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  template: `
    @if (signalr.latestAlert(); as alert) {
      <div class="bg-red-600 text-white px-4 py-3 flex items-center justify-between animate-pulse">
        <span class="font-semibold">
          🚨 CRITICAL: {{ formatType(alert.bloodTypeNeeded) }} blood needed —
          {{ alert.unitsNeeded }} units — {{ alert.patientContext }}
        </span>
        <button (click)="signalr.clearAlert()" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
      </div>
    }
  `
})
export class AlertBannerComponent {
  constructor(public signalr: SignalrService) {}
  formatType = formatBloodType;
}