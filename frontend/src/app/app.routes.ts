import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
