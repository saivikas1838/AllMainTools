import { Routes } from '@angular/router';
import { DataStructuresComponent } from './data-structures.component';
export const DATA_STRUCTURE_ROUTES: Routes = [

    {
        path: '',
        component: DataStructuresComponent,
        children: [
          {
            path: 'searching',
            loadComponent: () =>
              import('./algorithms/searching/searching.component')
                .then(m => m.SearchingComponent)
          },
          {
            path: 'sorting',
            loadComponent: () =>
              import('./algorithms/sorting/sorting.component')
                .then(m => m.SortingComponent)
          }
        ]
        }
]