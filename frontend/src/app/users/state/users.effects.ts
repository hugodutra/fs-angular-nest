import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { UsersService } from '../users.service';
import { loadUsers, loadUsersFailure, loadUsersSuccess } from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(({ page, limit, filters }) =>
        this.usersService.list({ page, limit, filters }).pipe(
          map((res) =>
            loadUsersSuccess({
              data: res.data,
              total: res.total,
              page: res.page,
              limit: res.limit,
            })
          ),
          catchError((err) =>
            of(
              loadUsersFailure({
                error:
                  err?.error?.message ??
                  err?.message ??
                  'Unable to load users.',
              })
            )
          )
        )
      )
    )
  );
}
