import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AuditLog } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-audit-logs.component.html'
})
export class AdminAuditLogsComponent implements OnInit {
  logs = signal<AuditLog[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAuditLogs(1, 100).subscribe(logs => this.logs.set(logs));
  }
}