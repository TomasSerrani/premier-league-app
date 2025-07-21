import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService } from '../../services/football';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css']
})
export class StandingsComponent implements OnInit {
  teams: any[] = [];
  filteredTeams: any[] = [];
  searchTerm: string = '';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private footballService: FootballService) {}

  ngOnInit(): void {
    this.footballService.getStandings().subscribe((data: any) => {
      this.teams = data.response[0].league.standings[0];
      this.filteredTeams = [...this.teams];
    });
  }

  // Filtro por nombre
  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.currentPage = 1; // reinicia la página al filtrar

    if (!term) {
      this.filteredTeams = [...this.teams];
      return;
    }

    this.filteredTeams = this.teams.filter(team =>
      team.team.name.toLowerCase().includes(term)
    );
  }

  // Equipos que se muestran según la página
  get paginatedTeams(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTeams.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTeams.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}