import { createAction, props } from '@ngrx/store';
import { UserListItem, UsersFilters } from './users.models';

export const loadUsers = createAction(
  '[Users] Load Users',
  props<{ page?: number; limit?: number; filters?: UsersFilters }>()
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ data: UserListItem[]; total: number; page: number; limit: number }>()
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>()
);
