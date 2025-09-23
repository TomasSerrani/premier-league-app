import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritosService } from '../services/favoritos.service';
import { FootballService } from '../services/football';
import { AuthService } from '../services/auth.service';
import { switchMap, of, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: any[] = [];
  filteredFavoritos: any[] = [];
  paginatedFavoritos: any[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private favoritosService: FavoritosService,
    private footballService: FootballService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        console.log('UID del usuario logueado:', user.uid);
        return this.favoritosService.getFavoritosDelUsuario(user.uid);
      })
    ).subscribe({
      next: (data) => {
        console.log('Favoritos recibidos:', data);
        this.favoritos = data;
        this.filteredFavoritos = [...this.favoritos];
        this.updatePagination();

        if (this.favoritos.length > 0) {
          // Hacemos todas las peticiones a la API en paralelo
          const requests = this.favoritos.map(fav =>
            this.footballService.getUltimosPartidos(fav.equipoId)
          );

          forkJoin(requests).subscribe((responses: any[]) => {
            this.favoritos = this.favoritos.map((f, i) => ({
              ...f,
              ultimosPartidos: responses[i].response
            }));
            this.filteredFavoritos = [...this.favoritos];
            this.updatePagination();
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error('Error al leer favoritos:', err);
      }
    });
  }

  getResultado(partido: any, equipoId: number): string {
    const esLocal = partido.teams.home.id === equipoId;
    const golesFavor = esLocal ? partido.goals.home : partido.goals.away;
    const golesContra = esLocal ? partido.goals.away : partido.goals.home;

    if (golesFavor > golesContra) return 'W';
    if (golesFavor < golesContra) return 'L';
    return 'D';
  }

  filterFavoritos() {
    this.filteredFavoritos = this.favoritos.filter(f =>
      f.nombreEquipo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
      this.favoritos = this.favoritos.filter(f => f.id !== id);
      this.filterFavoritos();
    });
  }
}
