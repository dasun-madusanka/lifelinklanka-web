import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'mfa-setup',
    loadComponent: () => import('./features/auth/mfa-setup/mfa-setup.component').then(m => m.MfaSetupComponent),
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  {
    path: 'donor/profile',
    loadComponent: () => import('./features/donor/donor-profile/donor-profile.component').then(m => m.DonorProfileComponent),
    canActivate: [roleGuard(['Donor'])]
  },
  {
    path: 'donor/matches',
    loadComponent: () => import('./features/donor/my-matches/my-matches.component').then(m => m.MyMatchesComponent),
    canActivate: [roleGuard(['Donor'])]
  },

  {
    path: 'blood-requests',
    loadComponent: () => import('./features/blood-requests/request-list/request-list.component').then(m => m.RequestListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'blood-requests/create',
    loadComponent: () => import('./features/blood-requests/create-request/create-request.component').then(m => m.CreateRequestComponent),
    canActivate: [roleGuard(['HospitalStaff', 'Admin'])]
  },
  {
    path: 'blood-requests/:id',
    loadComponent: () => import('./features/blood-requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
    canActivate: [authGuard]
  },

  {
    path: 'hospitals/register',
    loadComponent: () => import('./features/hospitals/register-hospital/register-hospital.component').then(m => m.RegisterHospitalComponent),
    canActivate: [roleGuard(['HospitalStaff', 'Admin'])]
  },

  {
    path: 'blood-banks/record-donation',
    loadComponent: () => import('./features/blood-banks/record-donation/record-donation.component').then(m => m.RecordDonationComponent),
    canActivate: [roleGuard(['BloodBank', 'Admin'])]
  },

  {
    path: 'documents/upload',
    loadComponent: () => import('./features/documents/upload/upload.component').then(m => m.UploadComponent),
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    canActivate: [roleGuard(['Admin'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'hospitals',
        loadComponent: () => import('./features/admin/admin-hospitals/admin-hospitals.component').then(m => m.AdminHospitalsComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/admin-audit-logs/admin-audit-logs.component').then(m => m.AdminAuditLogsComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];