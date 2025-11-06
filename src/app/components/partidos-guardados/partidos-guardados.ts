import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PartidosService } from '../../services/partidos.service';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-partidos-guardados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos-guardados.html',
  styleUrls: ['./partidos-guardados.css']
})
export class PartidosGuardadosComponent implements OnInit {
  partidos: any[] = [];
  loading = true;
  editandoId: string | null = null;
  notaTemporal = '';
  puntajeTemporal: number | null = null;

  constructor(
    private partidosService: PartidosService,
    private authService: AuthService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          if (!user) return of([]);
          return this.partidosService.getPartidosGuardados(user.uid);
        })
      )
      .subscribe(data => {
        this.zone.run(() => {
          this.partidos = data.sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          );
          this.loading = false;
        });
      });
  }

  eliminar(id: string) {
    this.partidosService.eliminarPartido(id);
  }

  editar(partido: any) {
    this.editandoId = partido.id;
    this.notaTemporal = partido.nota || '';
    this.puntajeTemporal = partido.puntaje || null;
  }

  cancelarEdicion() {
    this.editandoId = null;
  }

  guardarCambios(partidoId: string) {
    this.partidosService.updatePartido(partidoId, {
      nota: this.notaTemporal,
      puntaje: this.puntajeTemporal
    });
    this.editandoId = null;
  }
}
