import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { AuthService } from './core/services/auth.service';
import { SignalrService } from './core/services/signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShellComponent],
  template: `<app-shell><router-outlet /></app-shell>`
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, private signalr: SignalrService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.signalr.connect();
    }
  }
}