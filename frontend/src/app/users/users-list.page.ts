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
} from './state/users.actions';
import { logout } from '../auth/state/auth.actions';
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
} from './state/users.selectors';
import { UserListItem } from './state/users.models';
import { selectAuthUser } from '../auth/state/auth.selectors';
import {
  AddUserDialogComponent,
  AddUserPayload,
} from './add-user-dialog.component';
import {
  EditUserDialogComponent,
  EditUserPayload,
} from './edit-user-dialog.component';

@Component({
  standalone: true,
  selector: 'app-users-list-page',
  template: `
    <section class="users-page">
      <header class="users-page__header">
        <div>
          <h1>Users</h1>
          <p class="muted">List of users; admins can edit via dialog.</p>
        </div>
        <div class="users-page__actions">
          @if ((authUser$ | async)?.role === 'admin') {
          <button
            pButton
            type="button"
            label="Add User"
            icon="pi pi-plus"
            class="p-button-primary"
            data-testid="add-user-button"
            (click)="onAddUser()"
          ></button>
          }
          <button
            pButton
            type="button"
            label="Logout"
            class="p-button-text"
            icon="pi pi-sign-out"
            data-testid="logout-button"
            (click)="confirmLogout($event)"
          ></button>
        </div>
      </header>

      <p-table
        [value]="(users$ | async) || []"
        [paginator]="true"
        [rows]="(limit$ | async) || 10"
        [totalRecords]="(total$ | async) || 0"
        [loading]="loading$ | async"
        [lazy]="true"
        [first]="((page$ | async)! - 1) * ((limit$ | async) || 10)"
        selectionMode="single"
        dataKey="id"
        (onLazyLoad)="onLazyLoad($event)"
        (onRowSelect)="onRowSelect($event)"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Job Title</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr
            [pSelectableRow]="user"
            [pSelectableRowDisabled]="false"
            data-testid="users-row"
          >
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag
                [value]="user.role"
                [severity]="user.role === 'admin' ? 'info' : 'success'"
              ></p-tag>
            </td>
            <td>{{ user.jobTitle || '—' }}</td>
            <td>
              <p-tag
                [value]="user.isActive ? 'Active' : 'Inactive'"
                [severity]="user.isActive ? 'success' : 'danger'"
              ></p-tag>
            </td>
            <td>{{ user.updatedAt | date : 'short' }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="muted">No users found.</td>
          </tr>
        </ng-template>
      </p-table>

      <p-toast></p-toast>
      <p-confirmpopup></p-confirmpopup>

      <app-add-user-dialog
        [(visible)]="showAddDialog"
        [loading]="(createLoading$ | async) || false"
        [error]="createError$ | async"
        (submitUser)="onSubmit($event)"
        (visibleChange)="onDialogVisibilityChange($event)"
      />

      <app-edit-user-dialog
        [(visible)]="showEditDialog"
        [user]="selectedUser"
        [loading]="(updateLoading$ | async) || false"
        [error]="updateError$ | async"
        (submitUser)="onEditSubmit($event)"
        (visibleChange)="onEditDialogVisibilityChange($event)"
      />

      @if (error$ | async; as error) {
      <p class="error">{{ error }}</p>
      }
    </section>
  `,
  styles: [
    `
      .users-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .users-page__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .users-page__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      h1 {
        margin: 0;
      }
      .muted {
        color: #6b7280;
        margin: 0;
      }
      .error {
        color: #dc2626;
      }
    `,
  ],
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
