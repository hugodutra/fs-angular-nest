import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import {
  TableLazyLoadEvent,
  TableModule,
  TableRowSelectEvent,
} from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  loadUsers,
  createUserSuccess,
  createUser,
  resetCreateUserState,
  updateUser,
  resetUpdateUserState,
} from '../../state/users.actions';
import { logout } from '../../../auth/state/auth.actions';
import {
  selectUsersData,
  selectUsersError,
  selectUsersLimit,
  selectUsersLoading,
  selectUsersPage,
  selectUsersTotal,
  selectUsersCreateLoading,
  selectUsersCreateError,
  selectUsersCreateSuccess,
  selectUsersUpdateLoading,
  selectUsersUpdateError,
  selectUsersUpdateSuccess,
} from '../../state/users.selectors';
import { UserListItem } from '../../state/users.models';
import { selectAuthUser } from '../../../auth/state/auth.selectors';
import {
  AddUserDialogComponent,
  AddUserPayload,
} from '../../components/add-user-dialog/add-user-dialog.component';
import {
  EditUserDialogComponent,
  EditUserPayload,
} from '../../components/edit-user-dialog/edit-user-dialog.component';

@Component({
  standalone: true,
  selector: 'app-users-list-page',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  imports: [
    TableModule,
    TagModule,
    ButtonModule,
    ToastModule,
    ConfirmPopupModule,
    AsyncPipe,
    DatePipe,
    AddUserDialogComponent,
    EditUserDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class UsersListPage implements OnInit {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  users$ = this.store.select(selectUsersData) || [];
  total$ = this.store.select(selectUsersTotal) || 0;
  page$ = this.store.select(selectUsersPage) || 1;
  limit$ = this.store.select(selectUsersLimit) || 10;
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);
  createLoading$ = this.store.select(selectUsersCreateLoading);
  createError$ = this.store.select(selectUsersCreateError);
  createSuccess$ = this.store.select(selectUsersCreateSuccess);
  updateLoading$ = this.store.select(selectUsersUpdateLoading);
  updateError$ = this.store.select(selectUsersUpdateError);
  updateSuccess$ = this.store.select(selectUsersUpdateSuccess);
  authUser$ = this.store.select(selectAuthUser);
  selectedUser: UserListItem | null = null;
  showAddDialog = false;
  showEditDialog = false;
  private isAdmin = false;

  ngOnInit(): void {
    this.store.dispatch(loadUsers({ page: 1, limit: 10 }));

    this.authUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.isAdmin = user?.role === 'admin';
      });

    this.actions$
      .pipe(ofType(createUserSuccess), takeUntilDestroyed(this.destroyRef))
      .subscribe(({ user }) => {
        this.messageService.add({
          severity: 'success',
          summary: 'User created',
          detail: user.name || user.email,
        });
        this.showAddDialog = false;
        this.store.dispatch(resetCreateUserState());
      });

    this.createSuccess$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.showAddDialog = false;
      });

    this.updateSuccess$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'User updated',
          detail: this.selectedUser?.name || this.selectedUser?.email || 'User',
        });
        this.showEditDialog = false;
        this.selectedUser = null;
        this.store.dispatch(resetUpdateUserState());
      });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const rows = event.rows ?? 10;
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;
    this.store.dispatch(loadUsers({ page, limit: rows }));
  }

  onRowSelect(event: TableRowSelectEvent<UserListItem>) {
    if (!event.data || !this.isAdmin) {
      return;
    }

    this.selectedUser = Array.isArray(event.data)
      ? event.data[0]
      : (event.data as UserListItem);
    this.showEditDialog = true;
    this.store.dispatch(resetUpdateUserState());
  }

  onAddUser() {
    this.showAddDialog = true;
    this.store.dispatch(resetCreateUserState());
  }

  onDialogVisibilityChange(visible: boolean) {
    this.showAddDialog = visible;
    if (!visible) {
      this.store.dispatch(resetCreateUserState());
    }
  }

  onSubmit(payload: AddUserPayload) {
    this.store.dispatch(
      createUser({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        password: payload.password,
        jobTitle: payload.jobTitle,
        bio: payload.bio,
        isActive: payload.isActive,
      })
    );

    this.messageService.add({
      severity: 'success',
      summary: 'User created',
      detail: payload.email,
    });

    this.store.dispatch(resetCreateUserState());
    this.showAddDialog = false;
  }

  onEditDialogVisibilityChange(visible: boolean) {
    this.showEditDialog = visible;
    if (!visible) {
      this.selectedUser = null;
      this.store.dispatch(resetUpdateUserState());
    }
  }

  onEditSubmit(payload: EditUserPayload) {
    this.store.dispatch(updateUser(payload));
  }

  confirmLogout(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to log out?',
      icon: 'pi pi-sign-out',
      acceptButtonProps: {
        label: 'Logout',
        severity: 'danger',
        icon: 'pi pi-check',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        icon: 'pi pi-times',
      },
      accept: () => this.store.dispatch(logout()),
    });
  }
}
