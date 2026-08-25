import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DonorService } from '../../../core/services/donor.service';
import { DonorMatch, formatBloodType } from '../../../core/models/donor.models';

@Component({
  selector: 'app-my-matches',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-matches.component.html'
})
export class MyMatchesComponent implements OnInit {
  matches = signal<DonorMatch[]>([]);
  loading = signal(true);
  formatBloodType = formatBloodType;

  constructor(private donorService: DonorService) {}

  ngOnInit(): void {
    this.donorService.getMyMatches().subscribe({
      next: (matches) => {
        this.matches.set(matches);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}