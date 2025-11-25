import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.models';
import { clearError, login, loginFailure, loginSuccess } from './auth.actions';

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(login, (state) => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(clearError, (state) => ({ ...state, error: null }))
);
