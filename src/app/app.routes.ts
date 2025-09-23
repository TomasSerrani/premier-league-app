import { Routes } from '@angular/router';
import { StandingsComponent } from './components/standings/standings';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';
import { FavoritosComponent } from './favoritos/favoritos';

export const routes: Routes = [
  { path: '', component: StandingsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'favoritos', component: FavoritosComponent }
];
