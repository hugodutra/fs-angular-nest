import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { UsersService } from '../users.service';
import {
  createUser,
  createUserFailure,
  createUserSuccess,
  loadUsers,
  loadUsersFailure,
  loadUsersSuccess,
  updateUser,
  updateUserFailure,
  updateUserSuccess,
} from './users.actions';
import {
  selectUsersFilters,
  selectUsersLimit,
  selectUsersPage,
} from './users.selectors';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);
  private readonly store = inject(Store);

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

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUser),
      switchMap((payload) =>
        this.usersService.create(payload).pipe(
          map((user) => createUserSuccess({ user })),
          catchError((err) =>
            of(
              createUserFailure({
                error:
                  err?.error?.message ??
                  err?.message ??
                  'Unable to create user.',
              })
            )
          )
        )
      )
    )
  );

  reloadAfterCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createUserSuccess),
      withLatestFrom(
        this.store.select(selectUsersPage),
        this.store.select(selectUsersLimit),
        this.store.select(selectUsersFilters)
      ),
      map(([_, page, limit, filters]) => loadUsers({ page, limit, filters }))
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUser),
      switchMap(({ id, ...payload }) =>
        this.usersService.update(id, payload).pipe(
          map((user) => updateUserSuccess({ user })),
          catchError((err) =>
            of(
              updateUserFailure({
                error:
                  err?.error?.message ??
                  err?.message ??
                  'Unable to update user.',
              })
            )
          )
        )
      )
    )
  );
}
