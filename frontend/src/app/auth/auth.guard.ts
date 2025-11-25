import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectAuthToken } from './state/auth.selectors';

// Functional guard that allows access when a token is present; otherwise redirects to login.
export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthToken).pipe(
    take(1),
    map((token) => (token ? true : router.createUrlTree(['/login'])))
  );
};
