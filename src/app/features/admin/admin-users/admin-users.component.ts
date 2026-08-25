import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AdminUserSummary } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<AdminUserSummary[]>([]);
  roles = ['Admin', 'BloodBank', 'HospitalStaff', 'Donor', 'EmergencyCoordinator'];
  selectedRole: Record<string, string> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getUsers(1, 100).subscribe(users => this.users.set(users));
  }

  toggleActive(userId: string): void {
    this.adminService.toggleActive(userId).subscribe(() => this.loadUsers());
  }

  assignRole(userId: string): void {
    const role = this.selectedRole[userId];
    if (!role) return;
    this.adminService.assignRole(userId, role).subscribe(() => this.loadUsers());
  }
}