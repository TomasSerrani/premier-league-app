import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritosService } from '../services/favoritos.service'; 
import { FootballService } from '../services/football'; 
import { AuthService } from '../services/auth.service';
import { of, switchMap, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: any[] = [];
  filteredFavoritos: any[] = [];
  paginatedFavoritos: any[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private favoritosService: FavoritosService,
    private footballService: FootballService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user) return of([]);
          return this.favoritosService.getFavoritosDelUsuario(user.uid);
        })
      )
      .subscribe({
        next: (favoritos) => {
          this.zone.run(() => {
            this.favoritos = favoritos;
            this.filteredFavoritos = [...favoritos];
            this.updatePagination();
            
            // Solo cargamos partidos si hay favoritos
            if (this.favoritos.length > 0) {
              this.cargarUltimosPartidos();
            }
          });
        },
        error: (err) => console.error('Error al leer favoritos:', err)
      });
  }

  cargarUltimosPartidos() {
    // Creamos un array de peticiones a la API (una por cada equipo favorito)
    const requests = this.favoritos.map(fav =>
      this.footballService.getUltimosPartidos(fav.equipoId)
    );

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        this.zone.run(() => {
          // Mapeamos los resultados a cada favorito
          this.favoritos = this.favoritos.map((f, i) => {
            const resp = responses[i];
            const partidos = resp?.response || [];
            
            // Ordenamos por fecha (más reciente primero) y tomamos 3
            const ultimos = partidos
              .sort((a: any, b: any) =>
                new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
              )
              .slice(0, 3);
            
            return { ...f, ultimosPartidos: ultimos };
          });

          // Actualizamos la vista
          this.filteredFavoritos = [...this.favoritos];
          this.filterFavoritos(); // Re-aplicamos filtro por si el usuario buscaba algo
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error cargando partidos:', err)
    });
  }

  // --- CORRECCIÓN CRÍTICA AQUÍ ---
  getResultado(partido: any, equipoId: any): string {
    // Convertimos ambos a String para evitar el error de comparar "66" con 66
    // equipoId es el ID de tu favorito.
    // partido.teams.home.id es el ID del equipo local que viene de la API.
    
    const idLocal = String(partido.teams?.home?.id);
    const idFavorito = String(equipoId);

    const esLocal = idLocal === idFavorito;
    
    // Obtenemos goles
    const golesFavor = esLocal ? partido.goals.home : partido.goals.away;
    const golesContra = esLocal ? partido.goals.away : partido.goals.home;
    
    // Determinamos W (Win), L (Lose), D (Draw)
    if (golesFavor > golesContra) return 'W';
    if (golesFavor < golesContra) return 'L';
    return 'D';
  }

  // --- Lógica de Paginación y Filtros (Sin Cambios) ---

  filterFavoritos() {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredFavoritos = [...this.favoritos];
    } else {
      this.filteredFavoritos = this.favoritos.filter(f =>
        f.nombreEquipo.toLowerCase().includes(term)
      );
    }
    
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredFavoritos.length / this.itemsPerPage) || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedFavoritos = this.filteredFavoritos.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  eliminarFavorito(id: string) {
    this.favoritosService.eliminarFavorito(id).then(() => {
      this.zone.run(() => {
        this.favoritos = this.favoritos.filter(f => f.id !== id);
        this.filterFavoritos();
        this.cdr.detectChanges();
      });
    });
  }
}