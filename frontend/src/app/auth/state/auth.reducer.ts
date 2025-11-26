import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.models';
import {
  clearError,
  login,
  loginFailure,
  loginSuccess,
  logout,
  refresh,
  refreshFailure,
  refreshSuccess,
} from './auth.actions';

function loadPersistedAuth(): Pick<AuthState, 'user' | 'token'> {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const raw = localStorage.getItem('auth');
    if (!raw) {
      return { user: null, token: null };
    }
    const parsed = JSON.parse(raw) as {
      user: AuthState['user'];
      token: string;
    };
    return { user: parsed.user ?? null, token: parsed.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

const initialState: AuthState = {
  ...loadPersistedAuth(),
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
  on(refresh, (state) => ({ ...state, loading: true })),
  on(refreshSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(refreshFailure, (state) => ({ ...state, loading: false })),
  on(clearError, (state) => ({ ...state, error: null })),
  on(logout, () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }))
);
