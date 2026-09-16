import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { CriticalBloodAlert } from '../models/blood-request.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection?: signalR.HubConnection;

  // Real-time signals
  readonly latestAlert = signal<CriticalBloodAlert | null>(null);
  readonly alertsHistory = signal<CriticalBloodAlert[]>([]);
  readonly unreadAlertsCount = signal<number>(0);
  readonly soundEnabled = signal<boolean>(true);

  constructor(private tokenStorage: TokenStorageService) {}

  connect(): void {
    if (this.hubConnection) return; // already connected

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.tokenStorage.getAccessToken() ?? ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.hubConnection.on('CriticalBloodAlert', (alert: CriticalBloodAlert) => {
      this.handleIncomingAlert(alert);
    });

    this.hubConnection.on('BloodRequestAlert', (alert: CriticalBloodAlert) => {
      this.handleIncomingAlert(alert);
    });

    this.hubConnection.start().catch(err =>
      console.warn('SignalR connection postponed (API may be starting):', err)
    );
  }

  private handleIncomingAlert(alert: CriticalBloodAlert): void {
    this.latestAlert.set(alert);
    this.alertsHistory.update(prev => [alert, ...prev.slice(0, 19)]);
    this.unreadAlertsCount.update(c => c + 1);

    if (this.soundEnabled()) {
      this.playAlertChime();
    }
  }

  playAlertChime(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext policy or not allowed without user gesture
    }
  }

  toggleSound(): void {
    this.soundEnabled.update(s => !s);
  }

  markAllAsRead(): void {
    this.unreadAlertsCount.set(0);
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

  clearAlert(): void {
    this.latestAlert.set(null);
  }
}