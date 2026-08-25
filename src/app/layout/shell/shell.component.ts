import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AlertBannerComponent } from '../alert-banner/alert-banner.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NavbarComponent, AlertBannerComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar />
      <app-alert-banner />
      <main class="max-w-6xl mx-auto px-4 py-8">
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class ShellComponent {}