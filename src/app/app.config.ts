import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // si tenés rutas
import { FormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()), // ✅ ESTO es lo que te está faltando
    importProvidersFrom(FormsModule),
    provideRouter(routes) // si estás usando rutas
  ]
};