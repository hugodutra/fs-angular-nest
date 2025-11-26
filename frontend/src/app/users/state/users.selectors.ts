import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.models';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectUsersData = createSelector(
  selectUsersState,
  (state) => state.data
);

export const selectUsersTotal = createSelector(
  selectUsersState,
  (state) => state.total
);

export const selectUsersPage = createSelector(
  selectUsersState,
  (state) => state.page
);

export const selectUsersLimit = createSelector(
  selectUsersState,
  (state) => state.limit
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  (state) => state.loading
);

export const selectUsersError = createSelector(
  selectUsersState,
  (state) => state.error
);

export const selectUsersFilters = createSelector(
  selectUsersState,
  (state) => state.filters
);
