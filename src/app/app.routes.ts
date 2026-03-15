import { Routes } from '@angular/router';
import { LoginPageComponent } from '../login/login-page/login-page.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../login/login-page/login-page.component')
        .then(m => m.LoginPageComponent)
  },
  {
    path: 'tools',
    loadChildren: () =>
      import('../tools/tools.routes')
        .then(m => m.TOOLS_ROUTES)
  }
];
