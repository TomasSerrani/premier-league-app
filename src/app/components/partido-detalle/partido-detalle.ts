import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';  
import { PartidosService } from '../../services/partidos.service'; // Verifica la ruta
import { AuthService } from '../../services/auth.service';        // Verifica la ruta
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

  // 1. CONFIGURACIÓN DEL PROXY (Vital para evitar el error CORS en la web publicada)
  private proxyUrl = 'https://corsproxy.io/?'; 
  private baseUrl = 'https://api.football-data.org/v4';
  private apiKey = 'cacb4dd0adc144999951cbc85164c600'; 

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
    // 2. CONSTRUCCIÓN DE LA URL SEGURA
    const targetUrl = `${this.baseUrl}/teams/${this.teamId}/matches?status=FINISHED&limit=1`;
    // Envolvemos la URL en el proxy + encoding
    const url = this.proxyUrl + encodeURIComponent(targetUrl); 
    
    const headers = new HttpHeaders({
      'X-Auth-Token': this.apiKey
    });

    this.http.get(url, { headers }).subscribe({
      next: (response: any) => {
        const matches = response.matches;
        
        if (matches && matches.length > 0) {
          // Tomamos el último partido (el más reciente)
          const ultimoPartido = matches[matches.length - 1]; 
          
          // 3. ADAPTADOR: Transformamos los datos para que tu HTML no se rompa
          this.matchData = {
            fixture: {
              id: ultimoPartido.id,
              date: ultimoPartido.utcDate,
              venue: { name: "Estadio (No disp. gratis)" }
            },
            teams: {
              home: {
                name: ultimoPartido.homeTeam.name,
                logo: ultimoPartido.homeTeam.crest, // crest -> logo
                winner: ultimoPartido.score.winner === 'HOME_TEAM'
              },
              away: {
                name: ultimoPartido.awayTeam.name,
                logo: ultimoPartido.awayTeam.crest, // crest -> logo
                winner: ultimoPartido.score.winner === 'AWAY_TEAM'
              }
            },
            goals: {
              home: ultimoPartido.score.fullTime.home,
              away: ultimoPartido.score.fullTime.away
            }
          };

          this.loading = false;
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

  // Las estadísticas requieren pago, dejamos la función vacía para evitar errores 403.
  getMatchStats(fixtureId: number) {
    console.warn('Las estadísticas detalladas requieren un plan de pago en football-data.org');
    this.stats = [];
    this.loading = false;
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