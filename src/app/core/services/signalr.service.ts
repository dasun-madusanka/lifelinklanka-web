import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { CriticalBloodAlert } from '../models/blood-request.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  private hubConnection?: signalR.HubConnection;

  // Any component can read this signal to reactively show a live alert banner
  readonly latestAlert = signal<CriticalBloodAlert | null>(null);

  constructor(private tokenStorage: TokenStorageService) {}

  connect(): void {
    if (this.hubConnection) return; // already connected

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.tokenStorage.getAccessToken() ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('CriticalBloodAlert', (alert: CriticalBloodAlert) => {
      this.latestAlert.set(alert);
    });

    this.hubConnection.start().catch(err =>
      console.error('SignalR connection failed:', err)
    );
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = undefined;
  }

  clearAlert(): void {
    this.latestAlert.set(null);
  }
}