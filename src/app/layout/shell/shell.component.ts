import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AlertBannerComponent } from '../alert-banner/alert-banner.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { SignalrService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, DatePipe, NavbarComponent, SidebarComponent, AlertBannerComponent, FooterComponent],
  template: `
    @if (auth.isLoggedIn()) {
      <!-- ======================================================== -->
      <!-- AUTHENTICATED USER LAYOUT: ENTERPRISE SIDENAVIGATION     -->
      <!-- ======================================================== -->
      <div class="flex h-screen bg-slate-50 overflow-hidden">
        
        <!-- Left SideNavigation Bar (Docked on Desktop, Drawer on Mobile) -->
        <app-sidebar [mobileOpen]="isMobileDrawerOpen()" (closeMobileDrawer)="closeMobileDrawer()" />

        <!-- Main Content Column -->
        <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          <!-- Slim Executive Topbar -->
          <header class="h-16 bg-white border-b border-slate-200 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
            <!-- Left: Mobile Menu Trigger + Breadcrumb / System Status -->
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <!-- Mobile Hamburger Toggle -->
              <button (click)="toggleMobileDrawer()"
                      class="md:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
                      aria-label="Open Navigation Menu">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="hidden sm:inline">Clinical Transfusion Network</span>
              </span>
              <span class="text-slate-300 hidden sm:inline">/</span>
              <span class="text-xs font-black text-slate-900 truncate">{{ getPageTitle() }}</span>
            </div>

            <!-- Right: Actions & User Dropdown -->
            <div class="flex items-center gap-2 sm:gap-3">
              
              <!-- Realtime Chime Audio Toggle -->
              <button (click)="signalr.toggleSound()"
                      class="text-xs text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1"
                      [title]="signalr.soundEnabled() ? 'Audio alert chime ON' : 'Audio alert chime muted'">
                <span>{{ signalr.soundEnabled() ? '🔔' : '🔕' }}</span>
                <span class="text-[11px] font-medium hidden md:inline">{{ signalr.soundEnabled() ? 'Audio ON' : 'Muted' }}</span>
              </button>

              <!-- Notifications Bell -->
              <div class="relative">
                <button (click)="toggleNotifications()"
                        class="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                        aria-label="Emergency notifications">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  @if (signalr.unreadAlertsCount() > 0) {
                    <span class="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                      {{ signalr.unreadAlertsCount() }}
                    </span>
                  }
                </button>

                <!-- Notifications Dropdown -->
                @if (showNotifications()) {
                  <div class="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in duration-150">
                    <div class="p-3.5 bg-slate-950 text-white flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span class="font-black text-xs uppercase tracking-wider">Emergency Broadcasts</span>
                      </div>
                      <button (click)="clearNotifications()" class="text-[11px] text-red-300 hover:text-white font-semibold">Clear</button>
                    </div>

                    <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      @for (alert of signalr.alertsHistory(); track alert.id) {
                        <div class="p-3 hover:bg-slate-50 transition text-xs">
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-[10px]">
                              {{ alert.bloodTypeNeeded }} NEEDED
                            </span>
                            <span class="text-[10px] text-slate-400">{{ alert.neededByUtc ? (alert.neededByUtc | date:'shortTime') : 'Immediate' }}</span>
                          </div>
                          <p class="font-bold text-slate-800 text-[11px]">{{ alert.hospitalName }} ({{ alert.district }})</p>
                          <p class="text-slate-500 text-[11px] mt-0.5">{{ alert.patientContext }}</p>
                        </div>
                      }
                      @if (signalr.alertsHistory().length === 0) {
                        <div class="p-8 text-center text-xs text-slate-400">
                          <p>No active emergency broadcasts.</p>
                          <p class="text-[10px] text-slate-400 mt-1">Live requests will notify here immediately.</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- User Menu Dropdown -->
              <div class="relative">
                <button (click)="toggleUserMenu()"
                        class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                        aria-label="User profile menu">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 text-white font-black text-xs flex items-center justify-center shadow">
                    {{ auth.currentUser()?.fullName?.charAt(0) || 'U' }}
                  </div>
                  <div class="hidden lg:block text-left text-xs">
                    <p class="font-bold text-slate-800 leading-none truncate max-w-32">{{ auth.currentUser()?.fullName || 'User' }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ auth.roles()[0] || 'Member' }}</p>
                  </div>
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (showUserMenu()) {
                  <div class="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in duration-150">
                    <div class="p-3 border-b border-slate-100 mb-1">
                      <p class="font-bold text-slate-900 truncate">{{ auth.currentUser()?.fullName }}</p>
                      <p class="text-[11px] text-slate-500 truncate">{{ auth.currentUser()?.email }}</p>
                      <span class="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {{ auth.roles()[0] || 'Member' }}
                      </span>
                    </div>

                    <a routerLink="/" (click)="showUserMenu.set(false)" class="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">
                      Public Portal
                    </a>

                    @if (auth.hasRole('Admin')) {
                      <a routerLink="/admin/dashboard" (click)="showUserMenu.set(false)" class="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium">
                        Admin Executive Desk
                      </a>
                      <a routerLink="/admin/approvals" (click)="showUserMenu.set(false)" class="block px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-50 font-bold">
                        Pending Approvals
                      </a>
                    }

                    <button (click)="logout()"
                            class="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-rose-50 font-bold border-t border-slate-100 mt-1">
                      Sign Out
                    </button>
                  </div>
                }
              </div>

            </div>
          </header>

          <!-- System Alert Banner -->
          <app-alert-banner />

          <!-- Main Dynamic Page Content Area with Bottom Padding for Mobile Nav -->
          <main class="p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 flex-1 max-w-7xl w-full mx-auto">
            <router-outlet />
          </main>

        </div>

        <!-- ======================================================== -->
        <!-- AUTHENTICATED USER MOBILE BOTTOM DOCK (md:hidden)        -->
        <!-- ======================================================== -->
        <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-2 shadow-lg">
          <!-- 1. Dashboard -->
          <a [routerLink]="auth.hasRole('Admin') ? '/admin/dashboard' : '/dashboard'"
             routerLinkActive="text-red-600 font-black"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-red-600 transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">Home</span>
          </a>

          <!-- 2. Urgent Requests -->
          <a routerLink="/blood-requests"
             routerLinkActive="text-red-600 font-black"
             class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-red-600 transition relative">
            <svg class="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">Requests</span>
          </a>

          <!-- 3. Island Map -->
          <a routerLink="/map"
             routerLinkActive="text-red-600 font-black"
             class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-red-600 transition">
            <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">Map</span>
          </a>

          <!-- 4. Role Quick Action (Donor Card for Donor, Approvals for Admin, Stock for Staff/Bank) -->
          @if (auth.hasRole('Donor')) {
            <a routerLink="/donor/card"
               routerLinkActive="text-red-600 font-black"
               class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-red-600 transition">
              <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span class="text-[10px] mt-0.5 font-bold">Card</span>
            </a>
          } @else if (auth.hasRole('Admin')) {
            <a routerLink="/admin/approvals"
               routerLinkActive="text-amber-600 font-black"
               class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-amber-600 transition relative">
              <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-[10px] mt-0.5 font-bold">Approvals</span>
            </a>
          } @else {
            <a routerLink="/inventory"
               routerLinkActive="text-red-600 font-black"
               class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-red-600 transition">
              <svg class="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="text-[10px] mt-0.5 font-bold">Stock</span>
            </a>
          }

          <!-- 5. More / Menu Trigger -->
          <button (click)="toggleMobileDrawer()"
                  class="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 hover:text-slate-900 transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span class="text-[10px] mt-0.5 font-bold">Menu</span>
          </button>
        </nav>

      </div>
    } @else {
      <!-- ======================================================== -->
      <!-- PUBLIC / GUEST LAYOUT: CLEAN NAVBAR + ADAPTIVE VIEWPORT  -->
      <!-- ======================================================== -->
      <div class="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div class="flex-1 flex flex-col min-h-0">
          <app-navbar />
          @if (!isAuthPage()) {
            <app-alert-banner />
          }
          <main [ngClass]="getMainClass()">
            <router-outlet />
          </main>
        </div>
        @if (!isAuthPage()) {
          <app-footer />
        }
      </div>
    }
  `
})
export class ShellComponent implements OnInit {
  isHomePage = signal(false);
  isLoginPage = signal(false);
  isRegisterPage = signal(false);
  isAuthPage = computed(() => this.isLoginPage() || this.isRegisterPage());

  isMobileDrawerOpen = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);

  constructor(
    public auth: AuthService,
    public signalr: SignalrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateRoute(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateRoute(event.urlAfterRedirects || event.url);
      this.isMobileDrawerOpen.set(false);
      this.showNotifications.set(false);
      this.showUserMenu.set(false);
    });
  }

  private updateRoute(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    this.isHomePage.set(cleanUrl === '/' || cleanUrl === '');
    this.isLoginPage.set(cleanUrl === '/login');
    this.isRegisterPage.set(cleanUrl.startsWith('/register'));
  }

  getMainClass(): string {
    if (this.isLoginPage()) {
      return 'flex-1 flex items-center justify-center p-3 sm:p-6 overflow-y-auto w-full';
    }
    if (this.isRegisterPage()) {
      return 'flex-1 overflow-y-auto px-3 py-4 sm:py-8 max-w-4xl mx-auto w-full';
    }
    if (this.isHomePage()) {
      return 'w-full p-0 m-0 flex-1';
    }
    return 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1';
  }

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update(v => !v);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.signalr.markAllAsRead();
    }
  }

  clearNotifications(): void {
    this.signalr.clearAlert();
    this.showNotifications.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  logout(): void {
    this.showUserMenu.set(false);
    this.isMobileDrawerOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/admin/approvals')) return 'Verification Approvals Queue';
    if (url.startsWith('/admin/dashboard')) return 'Executive Surveillance Dashboard';
    if (url.startsWith('/admin/users')) return 'User & Role Directory';
    if (url.startsWith('/admin/hospitals')) return 'Hospital Accreditations';
    if (url.startsWith('/admin/audit-logs')) return 'Security Audit Trail';
    if (url.startsWith('/dashboard')) return 'Clinical Operations Dashboard';
    if (url.startsWith('/blood-requests/create')) return 'Broadcast Critical Request (SOS)';
    if (url.startsWith('/blood-requests')) return 'Emergency Hospital Requests';
    if (url.startsWith('/inventory')) return 'Cold-Chain Blood Inventory';
    if (url.startsWith('/camps')) return 'Mobile Blood Donation Camps';
    if (url.startsWith('/map')) return 'National Island Spatial Surveillance';
    if (url.startsWith('/appointments')) return 'Clinical Appointments Desk';
    if (url.startsWith('/donor/card')) return 'Encrypted Smart Donor Card';
    if (url.startsWith('/donor/profile')) return 'Donor Health & Eligibility';
    if (url.startsWith('/hospitals/register')) return 'Register Hospital Facility';
    if (url.startsWith('/blood-banks/record-donation')) return 'Donor Clinical Intake & Collection';
    return 'Precision Grid';
  }
}
