import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballService } from '../../services/football';
import { FavoritosService } from '../../services/favoritos.service';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './standings.html',
  styleUrls: ['./standings.css']
})
export class StandingsComponent implements OnInit {
  teams: any[] = [];
  filteredTeams: any[] = [];
  favoritos: any[] = [];  
  searchTerm: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private footballService: FootballService,
    private favoritosService: FavoritosService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}
  private auth = inject(Auth);
  

ngOnInit(): void {
  this.footballService.getStandings().subscribe({
    next: (data: any) => {
      if (
        data?.response &&
        data.response.length > 0 &&
        data.response[0]?.league?.standings?.length > 0
      ) {
        this.teams = data.response[0].league.standings[0];
        this.filteredTeams = [...this.teams];
      } else {
        console.warn('⚠️ No se encontraron standings válidos.');
        this.teams = [];
        this.filteredTeams = [];
      }
    },
    error: (err) => {
      console.error('❌ Error al cargar standings:', err);
      this.teams = [];
      this.filteredTeams = [];
    },
  });
}

  agregarAFavoritos(team: any) {
    this.favoritosService.agregarFavorito(team)
      .then(() => {
        this.favoritos.push(team); 
      })
      .catch(err => alert('Error al agregar favorito: ' + err));
  }

  eliminarAFavoritos(favId: string) {
    this.favoritosService.eliminarFavorito(favId)
      .then(() => {
        this.favoritos = this.favoritos.filter(f => f.id !== favId);
      })
      .catch(err => console.error('Error al eliminar favorito:', err));
      
  }
  
  isFavorito(equipoId: number): boolean {
  return this.favoritos.some(f => f.equipoId === String(equipoId));
}

toggleFavorito(team: any) {
  const fav = this.favoritos.find(f => f.equipoId === String(team.team.id));

  if (fav) {
    this.favoritosService.eliminarFavorito(fav.id).then(() => {
      this.favoritos = this.favoritos.filter(f => f.id !== fav.id);
    });
  } else {
    this.favoritosService.agregarFavorito(team).then(() => {
      this.favoritos.push({
        equipoId: String(team.team.id),
        nombreEquipo: team.team.name,
        logoEquipo: team.team.logo
      });
    });
  }
}
  filter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.currentPage = 1;

    if (!term) {
      this.filteredTeams = [...this.teams];
      return;
    }

    this.filteredTeams = this.teams.filter(team =>
      team.team.name.toLowerCase().includes(term)
    );
  }

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

