import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
        eventCoalescing: true
      }),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Lara
      }
    })
  ]
};
