import { Routes } from '@angular/router';
import { StandingsComponent } from './components/standings/standings';
import { RegisterComponent } from './auth/register/register';
import { LoginComponent } from './auth/login/login';

export const routes: Routes = [
  { path: '', component: StandingsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent }
];
