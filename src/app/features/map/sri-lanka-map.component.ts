import { Component, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { AnalyticsService } from '../../core/services/analytics.service';
import { HospitalService } from '../../core/services/hospital.service';
import { BloodBankService } from '../../core/services/blood-bank.service';
import { BloodRequestService } from '../../core/services/blood-request.service';
import { DistrictDemandSummary } from '../../core/models/analytics.models';
import { Hospital } from '../../core/models/hospital.models';
import { BloodBank } from '../../core/models/blood-bank.models';
import { BloodRequestSummary } from '../../core/models/blood-request.models';

export interface ProvinceInfo {
  name: string;
  districts: string[];
}

export interface DistrictGeo {
  name: string;
  province: string;
  lat: number;
  lng: number;
}

export const SRI_LANKA_DISTRICTS_GEO: DistrictGeo[] = [
  // Western Province
  { name: 'Colombo', province: 'Western', lat: 6.9271, lng: 79.8612 },
  { name: 'Gampaha', province: 'Western', lat: 7.0840, lng: 79.9939 },
  { name: 'Kalutara', province: 'Western', lat: 6.5854, lng: 79.9607 },

  // Central Province
  { name: 'Kandy', province: 'Central', lat: 7.2906, lng: 80.6337 },
  { name: 'Matale', province: 'Central', lat: 7.4675, lng: 80.6234 },
  { name: 'Nuwara Eliya', province: 'Central', lat: 6.9497, lng: 80.7891 },

  // Southern Province
  { name: 'Galle', province: 'Southern', lat: 6.0535, lng: 80.2210 },
  { name: 'Matara', province: 'Southern', lat: 5.9549, lng: 80.5550 },
  { name: 'Hambantota', province: 'Southern', lat: 6.1429, lng: 81.1212 },

  // Northern Province
  { name: 'Jaffna', province: 'Northern', lat: 9.6615, lng: 80.0255 },
  { name: 'Kilinochchi', province: 'Northern', lat: 9.3803, lng: 80.3770 },
  { name: 'Mannar', province: 'Northern', lat: 8.9810, lng: 79.9044 },
  { name: 'Vavuniya', province: 'Northern', lat: 8.7542, lng: 80.4982 },
  { name: 'Mullaitivu', province: 'Northern', lat: 9.2671, lng: 80.8142 },

  // Eastern Province
  { name: 'Batticaloa', province: 'Eastern', lat: 7.7310, lng: 81.6747 },
  { name: 'Ampara', province: 'Eastern', lat: 7.2975, lng: 81.6747 },
  { name: 'Trincomalee', province: 'Eastern', lat: 8.5874, lng: 81.2152 },

  // North Western Province
  { name: 'Kurunegala', province: 'North Western', lat: 7.4863, lng: 80.3623 },
  { name: 'Puttalam', province: 'North Western', lat: 8.0408, lng: 79.8394 },

  // North Central Province
  { name: 'Anuradhapura', province: 'North Central', lat: 8.3114, lng: 80.4037 },
  { name: 'Polonnaruwa', province: 'North Central', lat: 7.9403, lng: 81.0188 },

  // Uva Province
  { name: 'Badulla', province: 'Uva', lat: 6.9934, lng: 81.0550 },
  { name: 'Monaragala', province: 'Uva', lat: 6.8728, lng: 81.3507 },

  // Sabaragamuwa Province
  { name: 'Ratnapura', province: 'Sabaragamuwa', lat: 6.7056, lng: 80.3847 },
  { name: 'Kegalle', province: 'Sabaragamuwa', lat: 7.2513, lng: 80.3464 }
];

@Component({
  selector: 'app-sri-lanka-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sri-lanka-map.component.html'
})
export class SriLankaMapComponent implements OnInit, AfterViewInit, OnDestroy {
  districts = signal<DistrictDemandSummary[]>([]);
  hospitals = signal<Hospital[]>([]);
  bloodBanks = signal<BloodBank[]>([]);
  requests = signal<BloodRequestSummary[]>([]);
  loading = signal(true);

  selectedDistrict = signal<string>('Colombo');
  activeTileStyle = signal<'dark' | 'satellite' | 'osm'>('dark');

  provinces: ProvinceInfo[] = [
    { name: 'Western Province', districts: ['Colombo', 'Gampaha', 'Kalutara'] },
    { name: 'Central Province', districts: ['Kandy', 'Matale', 'Nuwara Eliya'] },
    { name: 'Southern Province', districts: ['Galle', 'Matara', 'Hambantota'] },
    { name: 'Northern Province', districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'] },
    { name: 'Eastern Province', districts: ['Batticaloa', 'Ampara', 'Trincomalee'] },
    { name: 'North Western Province', districts: ['Kurunegala', 'Puttalam'] },
    { name: 'North Central Province', districts: ['Anuradhapura', 'Polonnaruwa'] },
    { name: 'Uva Province', districts: ['Badulla', 'Monaragala'] },
    { name: 'Sabaragamuwa Province', districts: ['Ratnapura', 'Kegalle'] }
  ];

  districtGeoList = SRI_LANKA_DISTRICTS_GEO;

  private map?: L.Map;
  private currentTileLayer?: L.TileLayer;
  private markersLayer = L.layerGroup();
  private facilityMarkersLayer = L.layerGroup();

  constructor(
    private analyticsService: AnalyticsService,
    private hospitalService: HospitalService,
    private bloodBankService: BloodBankService,
    private requestService: BloodRequestService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap(): void {
    if (this.map) return;

    // Center of Sri Lanka
    this.map = L.map('sriLankaLeafletMap', {
      center: [7.8731, 80.7718],
      zoom: 8,
      minZoom: 7,
      maxZoom: 14,
      zoomControl: true
    });

    this.applyTileLayer(this.activeTileStyle());
    this.markersLayer.addTo(this.map);
    this.facilityMarkersLayer.addTo(this.map);

    this.map.on('zoomend', () => {
      this.renderFacilityMarkers();
    });

    this.renderMarkers();
    this.renderFacilityMarkers();
  }

  setBasemap(style: 'dark' | 'satellite' | 'osm'): void {
    this.activeTileStyle.set(style);
    this.applyTileLayer(style);
  }

  private applyTileLayer(style: 'dark' | 'satellite' | 'osm'): void {
    if (!this.map) return;

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    // Default: ESRI High-Contrast Dark Gray Canvas (Watermark-free, keyless, fast)
    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';
    let maxZoom = 16;

    if (style === 'satellite') {
      // ESRI World Imagery Satellite (Real high-res aerial imagery of Sri Lanka, keyless)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';
      maxZoom = 18;
    } else if (style === 'osm') {
      // Standard OpenStreetMap (Global open cartographic data, keyless)
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      maxZoom = 19;
    }

    this.currentTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom
    }).addTo(this.map);
  }

  loadData(): void {
    this.analyticsService.getDistrictSummaries().subscribe({
      next: data => {
        this.districts.set(data);
        this.loading.set(false);
        this.renderMarkers();
      },
      error: () => this.loading.set(false)
    });

    this.hospitalService.getAll().subscribe({
      next: h => {
        this.hospitals.set(h);
        this.renderFacilityMarkers();
      }
    });

    this.bloodBankService.getAll().subscribe({
      next: b => {
        this.bloodBanks.set(b);
        this.renderFacilityMarkers();
      }
    });

    this.requestService.getOpenRequests().subscribe({
      next: r => {
        this.requests.set(r);
        this.renderMarkers();
      }
    });
  }

  selectDistrict(name: string): void {
    this.selectedDistrict.set(name);
    const geo = this.districtGeoList.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (geo && this.map) {
      this.map.flyTo([geo.lat, geo.lng], 10, { duration: 0.8 });
    }
    this.renderMarkers();
    this.renderFacilityMarkers();
  }

  resetView(): void {
    if (this.map) {
      this.map.flyTo([7.8731, 80.7718], 8, { duration: 0.8 });
    }
  }

  private renderMarkers(): void {
    if (!this.map) return;
    this.markersLayer.clearLayers();

    for (const d of this.districtGeoList) {
      const isSelected = this.selectedDistrict().toLowerCase() === d.name.toLowerCase();
      const units = this.getDistrictUnits(d.name);
      const reqCount = this.getDistrictRequestsCount(d.name);

      let badgeBg = 'bg-slate-950/95 border-amber-500/60 shadow-black/80';
      let dotColor = 'bg-emerald-400';
      let textClass = 'text-amber-300 font-bold';

      if (reqCount > 0) {
        badgeBg = 'bg-rose-950/95 border-rose-500 shadow-rose-950/70';
        dotColor = 'bg-rose-400 animate-ping';
        textClass = 'text-rose-200 font-black';
      } else if (units < 30) {
        badgeBg = 'bg-amber-950/95 border-amber-500 shadow-amber-950/70';
        dotColor = 'bg-amber-400';
        textClass = 'text-amber-300 font-bold';
      }

      const activeRing = isSelected ? `
        <div class="absolute -inset-1 rounded-lg bg-red-500/50 animate-pulse"></div>
      ` : '';

      const html = `
        <div class="relative cursor-pointer select-none group" style="transform: translate(-50%, -50%);">
          ${activeRing}
          <div class="relative flex items-center gap-1.5 px-2 py-0.5 rounded-md shadow-lg border ${badgeBg} ${isSelected ? 'ring-2 ring-red-400 font-black scale-110' : ''} text-[11px] whitespace-nowrap transition-transform duration-150 hover:scale-115 backdrop-blur-sm">
            <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
            <span class="${textClass} tracking-tight">${d.name}</span>
            <span class="px-1 py-0.2 rounded bg-black/60 text-[9px] text-amber-300/90 font-mono font-medium">${units}u</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: 'custom-district-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([d.lat, d.lng], { icon });
      marker.on('click', () => {
        this.selectDistrict(d.name);
      });
      marker.addTo(this.markersLayer);
    }
  }

  private renderFacilityMarkers(): void {
    if (!this.map) return;
    this.facilityMarkersLayer.clearLayers();

    const selDist = this.selectedDistrict().toLowerCase();
    const selGeo = this.districtGeoList.find(d => d.name.toLowerCase() === selDist);
    if (!selGeo) return;

    // Hospitals in selected district
    const distHospitals = this.hospitals().filter(h => h.district?.toLowerCase() === selDist);
    distHospitals.forEach((h, idx) => {
      const angle = (idx / Math.max(1, distHospitals.length)) * 2 * Math.PI;
      const offsetLat = Math.cos(angle) * 0.04;
      const offsetLng = Math.sin(angle) * 0.04;
      const hospLat = selGeo.lat + offsetLat;
      const hospLng = selGeo.lng + offsetLng;

      const hospHtml = `
        <div class="w-6 h-6 rounded-lg bg-red-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[12px] font-black cursor-pointer hover:scale-125 transition" style="transform: translate(-50%, -50%);" title="${h.name}">
          +
        </div>
      `;

      const icon = L.divIcon({
        html: hospHtml,
        className: 'custom-hosp-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const m = L.marker([hospLat, hospLng], { icon });
      m.bindPopup(`
        <div class="p-2 text-slate-900 text-xs font-sans">
          <p class="font-extrabold text-red-600 text-[13px] leading-tight">${h.name}</p>
          <p class="text-slate-500 text-[11px] mt-0.5">${h.address || h.district}</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span>Phone: <strong>${h.contactPhone || 'N/A'}</strong></span>
            <span class="text-emerald-600 font-bold">${h.verificationStatus}</span>
          </div>
        </div>
      `);
      m.addTo(this.facilityMarkersLayer);
    });

    // Blood Banks in selected district
    const distBloodBanks = this.bloodBanks().filter(b => b.district?.toLowerCase() === selDist);
    distBloodBanks.forEach((b, idx) => {
      const angle = ((idx + 0.5) / Math.max(1, distBloodBanks.length)) * 2 * Math.PI;
      const offsetLat = Math.cos(angle) * 0.055;
      const offsetLng = Math.sin(angle) * 0.055;
      const bbLat = selGeo.lat + offsetLat;
      const bbLng = selGeo.lng + offsetLng;

      const bbHtml = `
        <div class="w-6 h-6 rounded-lg bg-sky-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-black cursor-pointer hover:scale-125 transition" style="transform: translate(-50%, -50%);" title="${b.name}">
          🩸
        </div>
      `;

      const icon = L.divIcon({
        html: bbHtml,
        className: 'custom-bb-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const m = L.marker([bbLat, bbLng], { icon });
      m.bindPopup(`
        <div class="p-2 text-slate-900 text-xs font-sans">
          <p class="font-extrabold text-sky-700 text-[13px] leading-tight">${b.name}</p>
          <p class="text-slate-500 text-[11px] mt-0.5">Cold Storage Blood Bank · ${b.district}</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span>Phone: <strong>${b.contactPhone || 'N/A'}</strong></span>
            <span class="text-sky-600 font-bold">${b.verificationStatus}</span>
          </div>
        </div>
      `);
      m.addTo(this.facilityMarkersLayer);
    });
  }

  get currentDistrictSummary(): DistrictDemandSummary | undefined {
    return this.districts().find(d => d.district?.toLowerCase() === this.selectedDistrict().toLowerCase());
  }

  getDistrictUnits(name: string): number {
    const s = this.districts().find(d => d.district?.toLowerCase() === name.toLowerCase());
    return s?.availableStockUnits ?? 0;
  }

  getDistrictRequestsCount(name: string): number {
    return this.requests().filter(r => (r.district || r.hospital?.district)?.toLowerCase() === name.toLowerCase()).length;
  }

  getDistrictHospitalsCount(name: string): number {
    return this.hospitals().filter(h => h.district?.toLowerCase() === name.toLowerCase()).length;
  }

  get districtHospitals(): Hospital[] {
    return this.hospitals().filter(h => h.district?.toLowerCase() === this.selectedDistrict().toLowerCase());
  }

  get districtBloodBanks(): BloodBank[] {
    return this.bloodBanks().filter(b => b.district?.toLowerCase() === this.selectedDistrict().toLowerCase());
  }

  get districtRequests(): BloodRequestSummary[] {
    return this.requests().filter(r => (r.district || r.hospital?.district)?.toLowerCase() === this.selectedDistrict().toLowerCase());
  }
}
