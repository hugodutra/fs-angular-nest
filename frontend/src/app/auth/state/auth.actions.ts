import { createAction, props } from '@ngrx/store';
import { AuthUser } from './auth.models';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const clearError = createAction('[Auth] Clear Error');

export const refresh = createAction('[Auth] Refresh');

export const refreshSuccess = createAction(
  '[Auth] Refresh Success',
  props<{ user: AuthUser; token: string }>()
);

export const refreshFailure = createAction('[Auth] Refresh Failure');

export const logout = createAction('[Auth] Logout');
