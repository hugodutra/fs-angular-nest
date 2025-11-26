import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  refreshSuccess,
} from './auth.actions';

const persistAuth = (user: unknown, token: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!token || !user) {
    localStorage.removeItem('auth');
    return;
  }
  localStorage.setItem('auth', JSON.stringify({ user, token }));
};

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((resp) =>
            loginSuccess({ user: resp.user, token: resp.accessToken })
          ),
          catchError((err) =>
            of(
              loginFailure({
                error:
                  err?.error?.message ??
                  err?.message ??
                  'Unable to sign in. Please check your credentials.',
              })
            )
          )
        )
      )
    )
  );

  loginSuccessPersist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user, token }) => persistAuth(user, token))
      ),
    { dispatch: false }
  );

  loginSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => {
          this.router.navigateByUrl('/users');
        })
      ),
    { dispatch: false }
  );

  refreshPersist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(refreshSuccess),
        tap(({ user, token }) => persistAuth(user, token))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          persistAuth(null, null);
          this.router.navigateByUrl('/login');
        })
      ),
    { dispatch: false }
  );
}
