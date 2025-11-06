import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';  
import { PartidosService } from '../../services/partidos.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-partido-detalle',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './partido-detalle.html',
  styleUrls: ['./partido-detalle.css']
})
export class PartidoDetalleComponent implements OnInit {
  teamId!: string;
  matchData: any = null;
  stats: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private partidosService: PartidosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('teamId')!;
    if (!this.teamId) {
      this.router.navigate(['/']);
      return;
    }
    this.getLastMatch();
  }

  getLastMatch() {
    const apiUrl = `https://v3.football.api-sports.io/fixtures?team=${this.teamId}&league=39&season=2023`;
    const headers = { 'x-apisports-key': '026e070a9ff0c869152d5a52c93f411d' };

    this.http.get(apiUrl, { headers }).subscribe({
      next: (response: any) => {
        const fixtures = response.response;
        if (fixtures.length > 0) {
          fixtures.sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
          this.matchData = fixtures[0];
          this.getMatchStats(this.matchData.fixture.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener partidos:', err);
        this.loading = false;
      }
    });
  }

  getMatchStats(fixtureId: number) {
    const apiUrl = `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`;
    const headers = { 'x-apisports-key': '026e070a9ff0c869152d5a52c93f411d' };

    this.http.get(apiUrl, { headers }).subscribe({
      next: (response: any) => {
        this.zone.run(() => {
          this.stats = response.response || [];
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al obtener estadísticas:', err);
        this.loading = false;
      }
    });
  }

  async guardarEstePartido() {
    const user = await firstValueFrom(this.authService.currentUser$);

    if (!user) {
      alert('Debes iniciar sesión para guardar el partido.');
      return;
    }

    if (!this.matchData) {
      alert('No hay datos del partido para guardar.');
      return;
    }

    const partido = {
  uid: user.uid,
  equipoLocal: this.matchData.teams.home.name,
  equipoVisitante: this.matchData.teams.away.name,
  logoLocal: this.matchData.teams.home.logo,
  logoVisitante: this.matchData.teams.away.logo,
  golesLocal: this.matchData.goals.home,
  golesVisitante: this.matchData.goals.away,
  estadio: this.matchData.fixture.venue.name,
  fecha: this.matchData.fixture.date,
  idFixture: this.matchData.fixture.id,
  nota: '',
  puntaje: null
};
    try {
  await this.partidosService.guardarPartido(partido);
  this.router.navigate(['/partidos-guardados']);
} catch (err) {
  console.error('Error al guardar partido:', err);
}
  }

  translations: { [key: string]: string } = {
    "Shots on Goal": "Tiros al arco",
    "Shots off Goal": "Tiros fuera",
    "Total Shots": "Tiros totales",
    "Blocked Shots": "Tiros bloqueados",
    "Shots insidebox": "Tiros dentro del área",
    "Shots outsidebox": "Tiros fuera del área",
    "Fouls": "Faltas",
    "Corner Kicks": "Tiros de esquina",
    "Offsides": "Fuera de juego",
    "Ball Possession": "Posesión del balón",
    "Yellow Cards": "Tarjetas amarillas",
    "Red Cards": "Tarjetas rojas",
    "Goalkeeper Saves": "Atajadas del arquero",
    "Total passes": "Pases totales",
    "Passes accurate": "Pases precisos",
    "Passes %": "Precisión de pases",
    "expected_goals": "Goles esperados (xG)",
    "Expected Goals": "Goles esperados (xG)",
    "expected_assists": "Asistencias esperadas (xA)",
    "Shots": "Disparos",
    "Dribbles": "Regates",
    "Duels": "Duelos ganados",
    "Throw Ins": "Saques de banda",
    "Free Kicks": "Tiros libres",
    "Penalties": "Penales",
    "Possession": "Posesión",
    "Tackles": "Entradas",
    "Clearances": "Despejes",
    "Substitutions": "Sustituciones"
  };
}
