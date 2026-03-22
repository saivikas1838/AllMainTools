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
    path:'dashboard',
    loadComponent: ()=>
      import('../dashboard/dashboard.component')
    .then(m=>m.DashboardComponent)
  },
  {
    path: 'tools',
    loadChildren: () =>
      import('../tools/tools.routes')
        .then(m => m.TOOLS_ROUTES)
  },
  {
    path: 'data-structures',
    loadChildren: () =>
      import('../data-structures/data-structure.routes')
        .then(m => m.DATA_STRUCTURE_ROUTES)
  }
];
