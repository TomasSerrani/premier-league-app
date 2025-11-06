import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FootballService {
  private apiUrl = 'https://v3.football.api-sports.io';
  private headers = new HttpHeaders({
    'X-RapidAPI-Key': '026e070a9ff0c869152d5a52c93f411d',
  });

  constructor(private http: HttpClient) {}

  getStandings(): Observable<any> {
    const url = `${this.apiUrl}/standings?league=39&season=2023`;
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => res || { response: [] }),
      catchError(err => {
        console.error('Error en getStandings:', err);
        return of({ response: [] });
      })
    );
  }

  getUltimosPartidos(teamId: string): Observable<any> {
    const url = `${this.apiUrl}/fixtures?team=${teamId}&season=2023`;
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => {
        if (!res?.response?.length) return { response: [] };

        const partidosOrdenados = res.response.sort(
          (a: any, b: any) =>
            new Date(b.fixture.date).getTime() -
            new Date(a.fixture.date).getTime()
        );
        return { response: partidosOrdenados.slice(0, 3) };
      }),
      catchError(err => {
        console.error('Error en getUltimosPartidos:', err);
        return of({ response: [] });
      })
    );
  }
}