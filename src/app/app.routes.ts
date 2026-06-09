// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ShellComponent } from './shared/components/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EstimateComponent } from './pages/estimate/estimate.component';
import { ResultsComponent } from './pages/results/results.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CatalogComponent } from './pages/catalog/catalog.component';

export const routes: Routes = [
  {
    path: '', component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'estimate',  component: EstimateComponent },
      { path: 'results',   component: ResultsComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'catalog',   component: CatalogComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
