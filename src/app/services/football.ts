import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FootballService {
  // 1. TRUCO: Usamos un proxy para evitar el bloqueo CORS en producción
  // 'corsproxy.io' actúa de intermediario.
  private proxyUrl = 'https://corsproxy.io/?'; 
  private baseUrl = 'https://api.football-data.org/v4';
  
  private apiKey = 'cacb4dd0adc144999951cbc85164c600'; 

  private headers = new HttpHeaders({
    'X-Auth-Token': this.apiKey,
  });

  constructor(private http: HttpClient) {}

  getStandings(): Observable<any> {
    // 2. CONSTRUCCIÓN DE URL: Proxy + URL Real Encoded
    // encodeURIComponent es vital para que el proxy entienda la dirección
    const targetUrl = `${this.baseUrl}/competitions/PL/standings?season=2024`;
    const url = this.proxyUrl + encodeURIComponent(targetUrl);

    console.log('📡 Conectando vía Proxy a:', targetUrl);

    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        // ... (Todo el resto de tu lógica de transformación de datos SE MANTIENE IGUAL)
        if (!res || !res.standings) return { response: [] };

        const tablaOriginal = res.standings.find((s: any) => s.type === 'TOTAL')?.table || [];

        const tablaTransformada = tablaOriginal.map((item: any) => {
          return {
            rank: item.position,
            points: item.points,
            goalsDiff: item.goalDifference,
            team: {
              id: item.team.id,
              name: item.team.shortName || item.team.name,
              logo: item.team.crest
            },
            all: {
              played: item.playedGames,
              win: item.won,
              draw: item.draw,
              lose: item.lost,
              goals: {
                for: item.goalsFor,
                against: item.goalsAgainst
              }
            },
            form: item.form
          };
        });

        return {
          response: [{
            league: {
              id: 39,
              name: "Premier League",
              country: "England",
              standings: [ tablaTransformada ]
            }
          }]
        };
      }),
      catchError(err => {
        console.error('❌ Error CORS o de Red:', err);
        return of({ response: [] });
      })
    );
  }

  getUltimosPartidos(teamId: string): Observable<any> {
    // Aplicamos el mismo truco del Proxy aquí también
    const targetUrl = `${this.baseUrl}/teams/${teamId}/matches?status=FINISHED&limit=3`;
    const url = this.proxyUrl + encodeURIComponent(targetUrl);
    
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        if (!res?.matches) return { response: [] };
        const partidos = res.matches.map((match: any) => ({
            fixture: { date: match.utcDate, status: { short: 'FT' } },
            teams: {
                home: { id: match.homeTeam.id, name: match.homeTeam.name, logo: match.homeTeam.crest, winner: match.score.winner === 'HOME_TEAM' },
                away: { id: match.awayTeam.id, name: match.awayTeam.name, logo: match.awayTeam.crest, winner: match.score.winner === 'AWAY_TEAM' }
            },
            goals: { home: match.score.fullTime.home, away: match.score.fullTime.away }
        }));
        return { response: partidos };
      }),
      catchError(err => of({ response: [] }))
    );
  }
}