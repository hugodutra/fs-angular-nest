import { createReducer, on } from '@ngrx/store';
import { loadUsers, loadUsersFailure, loadUsersSuccess } from './users.actions';
import { UsersState } from './users.models';

const initialState: UsersState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  filters: {},
};

export const usersReducer = createReducer(
  initialState,
  on(loadUsers, (state, { page, limit, filters }) => ({
    ...state,
    loading: true,
    error: null,
    page: page ?? state.page,
    limit: limit ?? state.limit,
    filters: filters ?? state.filters,
  })),
  on(loadUsersSuccess, (state, { data, total, page, limit }) => ({
    ...state,
    data,
    total,
    page,
    limit,
    loading: false,
  })),
  on(loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
