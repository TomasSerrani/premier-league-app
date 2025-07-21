import { Component } from '@angular/core';
import { StandingsComponent } from './components/standings/standings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StandingsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}