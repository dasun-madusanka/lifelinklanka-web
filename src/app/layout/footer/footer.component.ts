import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-slate-950 text-slate-400 text-sm mt-16 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          <!-- Col 1: Brand & Mission -->
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-white font-bold text-lg">
              <img src="/assets/logo.png" alt="LifeLink Lanka Logo" class="w-9 h-9 object-contain drop-shadow" />
              <span>LifeLink Lanka</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Real-time national transfusion intelligence network uniting voluntary blood donors, accredited healthcare institutions, and regional cold-chain storage facilities across Sri Lanka.
            </p>
            <div class="text-xs text-slate-500">
              <p class="font-semibold text-slate-400">Digital Life Science & Blood Grid</p>
              <p>25 District Clinical Transfusion Network</p>
            </div>
          </div>

          <!-- Col 2: Transfusion Standards & Safety -->
          <div>
            <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-3">Safety & Quality Standards</h4>
            <ul class="space-y-2 text-xs">
              <li class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>100% Voluntary Non-Remunerated Network</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Stringent Multi-Marker Viral Screening</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Automated 120-Day Donor Cooldown Protection</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Monitored Cold-Chain (-4°C to -30°C Storage)</span>
              </li>
            </ul>
          </div>

          <!-- Col 3: Quick Navigation -->
          <div>
            <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-3">System Portals</h4>
            <ul class="space-y-2 text-xs">
              <li><a routerLink="/blood-requests" class="hover:text-white transition">Emergency Blood Requests</a></li>
              <li><a routerLink="/inventory" class="hover:text-white transition">Cold Chain & Blood Bank Stock</a></li>
              <li><a routerLink="/camps" class="hover:text-white transition">Upcoming Mobile Blood Drives</a></li>
              <li><a routerLink="/map" class="hover:text-white transition">Sri Lanka District Directory & Map</a></li>
              <li><a routerLink="/donor/card" class="hover:text-white transition">Smart Blood Donor Card</a></li>
              <li><a routerLink="/appointments" class="hover:text-white transition">Book Donation Appointment</a></li>
            </ul>
          </div>

          <!-- Col 4: Donor Eligibility Rules -->
          <div>
            <h4 class="text-white font-semibold text-sm uppercase tracking-wider mb-3">Quick Donor Criteria</h4>
            <ul class="space-y-1.5 text-xs text-slate-400">
              <li>✓ Age between 18 and 60 years</li>
              <li>✓ Body weight minimum 45 kg</li>
              <li>✓ Hemoglobin level above 12.5 g/dL</li>
              <li>✓ Minimum 120-day interval between donations</li>
              <li>✓ Free from active fever, cold, or infections</li>
            </ul>
          </div>

        </div>

        <div class="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 LifeLink Lanka. All rights reserved. Precision Healthcare & Blood Transfusion Network.</p>
          <p class="mt-2 sm:mt-0">Saving lives across all 9 provinces & 25 districts.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
