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

export const selectUsersCreateLoading = createSelector(
  selectUsersState,
  (state) => state.createLoading
);

export const selectUsersError = createSelector(
  selectUsersState,
  (state) => state.error
);

export const selectUsersCreateError = createSelector(
  selectUsersState,
  (state) => state.createError
);

export const selectUsersCreateSuccess = createSelector(
  selectUsersState,
  (state) => state.createSuccess
);

export const selectUsersUpdateLoading = createSelector(
  selectUsersState,
  (state) => state.updateLoading
);

export const selectUsersUpdateError = createSelector(
  selectUsersState,
  (state) => state.updateError
);

export const selectUsersUpdateSuccess = createSelector(
  selectUsersState,
  (state) => state.updateSuccess
);

export const selectUsersFilters = createSelector(
  selectUsersState,
  (state) => state.filters
);
