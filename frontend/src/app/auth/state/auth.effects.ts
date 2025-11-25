import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth.service';
import { login, loginFailure, loginSuccess } from './auth.actions';

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

  loginSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => {
          this.router.navigateByUrl('/dashboard');
        })
      ),
    { dispatch: false }
  );
}
