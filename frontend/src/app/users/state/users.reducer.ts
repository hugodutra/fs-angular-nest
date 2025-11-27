import { createReducer, on } from '@ngrx/store';
import {
  createUser,
  createUserFailure,
  createUserSuccess,
  loadUsers,
  loadUsersFailure,
  loadUsersSuccess,
  resetCreateUserState,
  resetUpdateUserState,
  updateUser,
  updateUserFailure,
  updateUserSuccess,
} from './users.actions';
import { UsersState } from './users.models';

const initialState: UsersState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  createLoading: false,
  error: null,
  createError: null,
  createSuccess: false,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
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
  })),
  on(createUser, (state) => ({
    ...state,
    createLoading: true,
    createError: null,
    createSuccess: false,
  })),
  on(createUserSuccess, (state) => ({
    ...state,
    createLoading: false,
    createError: null,
    createSuccess: true,
  })),
  on(createUserFailure, (state, { error }) => ({
    ...state,
    createLoading: false,
    createError: error,
    createSuccess: false,
  })),
  on(resetCreateUserState, (state) => ({
    ...state,
    createLoading: false,
    createError: null,
    createSuccess: false,
  })),
  on(updateUser, (state) => ({
    ...state,
    updateLoading: true,
    updateError: null,
    updateSuccess: false,
  })),
  on(updateUserSuccess, (state, { user }) => ({
    ...state,
    data: state.data.map((u) => (u.id === user.id ? user : u)),
    updateLoading: false,
    updateError: null,
    updateSuccess: true,
  })),
  on(updateUserFailure, (state, { error }) => ({
    ...state,
    updateLoading: false,
    updateError: error,
    updateSuccess: false,
  })),
  on(resetUpdateUserState, (state) => ({
    ...state,
    updateLoading: false,
    updateError: null,
    updateSuccess: false,
  }))
);
