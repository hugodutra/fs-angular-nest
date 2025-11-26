import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  catchError,
  firstValueFrom,
  from,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { selectAuthToken } from './state/auth.selectors';
import { AuthResponse, AuthService } from './auth.service';
import {
  logout,
  refresh,
  refreshFailure,
  refreshSuccess,
} from './state/auth.actions';

let refreshInFlight: Promise<AuthResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const authService = inject(AuthService);
  let token: string | null = null;

  store
    .select(selectAuthToken)
    .pipe(take(1))
    .subscribe((t) => (token = t));

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  const isAuthPath =
    req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthPath) {
        if (!refreshInFlight) {
          store.dispatch(refresh());
          refreshInFlight = firstValueFrom(authService.refresh());
        }

        return from(refreshInFlight).pipe(
          switchMap((resp) => {
            store.dispatch(
              refreshSuccess({ user: resp.user, token: resp.accessToken })
            );
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${resp.accessToken}` },
            });
            refreshInFlight = null;
            return next(retried);
          }),
          catchError((refreshError) => {
            refreshInFlight = null;
            store.dispatch(refreshFailure());
            store.dispatch(logout());
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
