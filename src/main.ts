import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js'; 
import { provideHttpClient, withFetch } from '@angular/common/http';


bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch()), // Para evitar el warning de XHR
  ]
});