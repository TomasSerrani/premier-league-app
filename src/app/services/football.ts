import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private apiUrl = 'https://v3.football.api-sports.io/standings?league=39&season=2024';
  private headers = new HttpHeaders({
    'x-apisports-key': '74b2e353eafe98d4647e88577a1285fd'
  });

  constructor(private http: HttpClient) {}

  getStandings(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.headers });
  }
}
