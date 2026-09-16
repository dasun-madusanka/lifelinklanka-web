import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { BloodBankService } from '../../core/services/blood-bank.service';
import { AuthService } from '../../core/services/auth.service';
import { BloodInventoryItem, BloodStockSummary, AddInventoryDto } from '../../core/models/inventory.models';
import { BloodBank } from '../../core/models/blood-bank.models';
import { BloodType, BLOOD_TYPES, formatBloodType } from '../../core/models/donor.models';
import { BloodComponentType, BLOOD_COMPONENTS, formatComponentType } from '../../core/models/blood-request.models';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-dashboard.component.html'
})
export class InventoryDashboardComponent implements OnInit {
  bloodTypes = BLOOD_TYPES;
  components = BLOOD_COMPONENTS;
  formatBloodType = formatBloodType;
  formatComponentType = formatComponentType;

  inventory = signal<BloodInventoryItem[]>([]);
  summaries = signal<BloodStockSummary[]>([]);
  bloodBanks = signal<BloodBank[]>([]);
  loading = signal(true);

  // Filters
  selectedDistrict = '';
  selectedType: string = '';
  selectedComponent: string = '';

  // Add stock modal
  showAddModal = signal(false);
  newStock: AddInventoryDto = {
    bloodBankId: '',
    bloodType: 'OPositive',
    componentType: 'PackedRedBloodCells',
    units: 10,
    storageLocation: 'Cold Room CR-01',
    batchNumber: 'LK-NBTS-2026',
    expiryDateUtc: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
  };

  // Stock Adjustment modal
  showAdjustModal = signal(false);
  selectedItem = signal<BloodInventoryItem | null>(null);
  adjustDelta = 1;
  adjustReason = 'Donation Intake';

  districts = [
    'All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kurunegala', 'Anuradhapura', 'Badulla'
  ];

  constructor(
    private inventoryService: InventoryService,
    private bloodBankService: BloodBankService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.inventoryService.getStockSummary().subscribe({
      next: sums => this.summaries.set(sums)
    });

    this.inventoryService.getInventory(
      this.selectedDistrict && this.selectedDistrict !== 'All Districts' ? this.selectedDistrict : undefined,
      this.selectedType || undefined,
      this.selectedComponent || undefined
    ).subscribe({
      next: items => {
        this.inventory.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.bloodBankService.getAll().subscribe({
      next: banks => {
        this.bloodBanks.set(banks);
        if (banks.length > 0 && !this.newStock.bloodBankId) {
          this.newStock.bloodBankId = banks[0].id;
        }
      }
    });
  }

  applyFilter(): void {
    this.loadData();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  submitAddStock(): void {
    this.inventoryService.addInventory(this.newStock).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadData();
      }
    });
  }

  openAdjustModal(item: BloodInventoryItem): void {
    this.selectedItem.set(item);
    this.adjustDelta = -1;
    this.adjustReason = 'Transfusion Issued';
    this.showAdjustModal.set(true);
  }

  closeAdjustModal(): void {
    this.showAdjustModal.set(false);
    this.selectedItem.set(null);
  }

  submitStockAdjustment(): void {
    const item = this.selectedItem();
    if (!item) return;

    this.inventoryService.updateStock(item.id, {
      unitsDelta: this.adjustDelta,
      reason: this.adjustReason
    }).subscribe({
      next: () => {
        this.closeAdjustModal();
        this.loadData();
      }
    });
  }

  discardBatch(item: BloodInventoryItem): void {
    if (!confirm(`Are you sure you want to discard batch ${item.batchNumber} (${item.unitsAvailable} units of ${this.formatBloodType(item.bloodType)})?`)) return;

    this.inventoryService.discardBatch(item.id).subscribe({
      next: () => this.loadData()
    });
  }
}
