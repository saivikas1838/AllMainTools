import { Routes } from '@angular/router';
import { ToolscomponentComponent } from './toolscomponent.component';

export const TOOLS_ROUTES: Routes = [
    {
        path: '',
        component: ToolscomponentComponent
    },
    {
        path: 'calculator',
        loadComponent: () =>
            import('./calculator/calculator.component')
                .then(m => m.CalculatorComponent)
    }
];