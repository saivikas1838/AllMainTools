import { Routes } from '@angular/router';
import { ToolscomponentComponent } from './toolscomponent.component';

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    component: ToolscomponentComponent,
    children: [
      {
        path: 'calculator',
        loadComponent: () =>
          import('./calculator/calculator.component')
            .then(m => m.CalculatorComponent)
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./contact/contact.component')
            .then(m => m.ContactComponent)
      }
    ]
  }
];