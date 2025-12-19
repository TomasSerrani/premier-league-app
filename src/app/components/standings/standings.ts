import { Component, OnInit, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Auth, user } from '@angular/fire/auth'; 
import { Subscription } from 'rxjs'; 

// Verifica que estas rutas sean correctas según tu estructura de carpetas
import { FootballService } from '../../services/football'; 
import { FavoritosService } from '../../services/favoritos.service';

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

  // Inyección de Auth
  private auth: Auth = inject(Auth);
  user$ = user(this.auth); 
  userSubscription: Subscription | undefined;

  constructor(
    private footballService: FootballService,
    private favoritosService: FavoritosService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // 1. CARGAR STANDINGS
    this.footballService.getStandings().subscribe({
      next: (data: any) => {
        if (
          data?.response &&
          data.response.length > 0 &&
          data.response[0]?.league?.standings?.length > 0
        ) {
          this.teams = data.response[0].league.standings[0];
          this.filteredTeams = [...this.teams];
          console.log('✅ Standings cargados correctamente');
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

    // 2. CARGAR FAVORITOS (CORREGIDO)
    this.userSubscription = this.user$.subscribe((usuario) => {
      if (usuario) {
        // CORRECCIÓN: Usamos el nombre correcto del método y le pasamos el UID
        this.favoritosService.getFavoritosDelUsuario(usuario.uid).subscribe({
          next: (favs: any[]) => {
            this.favoritos = favs;
            // Forzamos la detección de cambios para pintar las estrellas ★
            this.cdr.detectChanges(); 
          },
          error: (error: any) => console.error('Error cargando favoritos', error)
        });
      }
    });
  }

  // --- LÓGICA DE FAVORITOS ---

  isFavorito(equipoId: number | string): boolean {
    // Convertimos a string para asegurar que la comparación funcione
    return this.favoritos.some(f => String(f.equipoId) === String(equipoId));
  }

  toggleFavorito(team: any) {
    const fav = this.favoritos.find(f => String(f.equipoId) === String(team.team.id));

    if (fav) {
      // BORRAR FAVORITO
      this.favoritosService.eliminarFavorito(fav.id)
        .then(() => {
          this.favoritos = this.favoritos.filter(f => f.id !== fav.id);
        })
        .catch(err => alert('Error al eliminar: ' + err));
    } else {
      // AGREGAR FAVORITO
      const nuevoFavorito = {
        equipoId: String(team.team.id),
        nombreEquipo: team.team.name,
        logoEquipo: team.team.logo
      };

      this.favoritosService.agregarFavorito(nuevoFavorito)
        .then(() => {
          // Agregamos visualmente (idealmente recargarías la lista, pero esto es más rápido)
          // Nota: al recargar la página se arreglará el ID temporal si fuera necesario
          this.favoritos.push({ ...nuevoFavorito, id: 'temp' }); 
          
          // Opcional: Recargar la lista real para tener el ID correcto de Firebase
          // this.recargarFavoritos(); 
        })
        .catch(err => alert('Error al agregar: ' + err));
    }
  }

  // --- PAGINACIÓN Y FILTROS ---

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
      window.scrollTo(0, 0); 
    }
  }
}