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

export const createUser = createAction(
  '[Users] Create User',
  props<{
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    password: string;
    jobTitle?: string | null;
    bio?: string | null;
    isActive?: boolean;
  }>()
);

export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: UserListItem }>()
);

export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: string }>()
);

export const resetCreateUserState = createAction(
  '[Users] Reset Create User State'
);
