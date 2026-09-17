import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SignalrService } from '../../core/services/signalr.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() mobileOpen = false;
  @Output() closeMobileDrawer = new EventEmitter<void>();

  isCollapsed = signal(false);
  pendingApprovalsCount = signal(0);
  private routerSub?: Subscription;

  constructor(
    public auth: AuthService,
    public signalr: SignalrService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.hasRole('Admin')) {
      this.refreshPendingCount();
    }

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeDrawer();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  closeDrawer(): void {
    this.closeMobileDrawer.emit();
  }

  refreshPendingCount(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        if (stats.pendingApprovals !== undefined) {
          this.pendingApprovalsCount.set(stats.pendingApprovals);
        }
      },
      error: () => {}
    });
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getRoleColor(): string {
    if (this.auth.hasRole('Admin')) return 'from-purple-700 to-red-600';
    if (this.auth.hasRole('HospitalStaff')) return 'from-sky-600 to-blue-700';
    if (this.auth.hasRole('BloodBank')) return 'from-amber-600 to-rose-600';
    return 'from-rose-600 to-red-700';
  }

  getRoleBadgeLabel(): string {
    if (this.auth.hasRole('Admin')) return 'System Admin';
    if (this.auth.hasRole('HospitalStaff')) return 'Hospital Staff';
    if (this.auth.hasRole('BloodBank')) return 'Blood Bank';
    if (this.auth.hasRole('Donor')) return 'Voluntary Donor';
    return 'Member';
  }
}
