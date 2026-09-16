import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignalrService } from '../../core/services/signalr.service';
import { formatBloodType } from '../../core/models/donor.models';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (signalr.latestAlert(); as alert) {
      <div class="bg-gradient-to-r from-red-700 via-rose-600 to-red-700 text-white px-4 py-3 shadow-lg border-b border-red-800 animate-pulse">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-white animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded border border-white/30">
              🚨 CRITICAL SOS BROADCAST
            </span>
            <span class="font-medium text-sm">
              <strong class="font-bold underline">{{ formatType(alert.bloodTypeNeeded) }}</strong> needed at
              <strong>{{ alert.hospitalName ?? 'Hospital' }}</strong> ({{ alert.district ?? 'Sri Lanka' }}):
              <span class="text-rose-100">{{ alert.unitsNeeded }} units · {{ alert.patientContext }}</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            @if (alert.id) {
              <a [routerLink]="['/blood-requests', alert.id]" class="text-xs bg-white text-red-700 font-bold px-3 py-1.5 rounded-lg shadow hover:bg-red-50 transition">
                Respond Now
              </a>
            }
            <button (click)="signalr.clearAlert()" class="text-white/80 hover:text-white text-xl leading-none px-2">&times;</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AlertBannerComponent {
  constructor(public signalr: SignalrService) {}
  formatType = formatBloodType;
}