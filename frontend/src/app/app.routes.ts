import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./users/pages/users-list/users-list.page').then(
        (m) => m.UsersListPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'users' },
];
