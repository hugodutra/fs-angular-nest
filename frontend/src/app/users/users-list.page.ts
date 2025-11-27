import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
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
import { MessageService } from 'primeng/api';
import {
  loadUsers,
  createUserSuccess,
  createUser,
  resetCreateUserState,
} from './state/users.actions';
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
} from './state/users.selectors';
import { UserListItem } from './state/users.models';
import { selectAuthUser } from '../auth/state/auth.selectors';
import {
  AddUserDialogComponent,
  AddUserPayload,
} from './add-user-dialog.component';

@Component({
  standalone: true,
  selector: 'app-users-list-page',
  template: `
    <section class="users-page">
      <header class="users-page__header">
        <div>
          <h1>Users</h1>
          <p class="muted">List of users; admins can edit via profile.</p>
        </div>
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
          <tr [pSelectableRow]="user.id" [pSelectableRowDisabled]="false">
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

      <app-add-user-dialog
        [(visible)]="showAddDialog"
        [loading]="(createLoading$ | async) || false"
        [error]="createError$ | async"
        (submitUser)="onSubmit($event)"
        (visibleChange)="onDialogVisibilityChange($event)"
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
    AsyncPipe,
    DatePipe,
    AddUserDialogComponent,
  ],
  providers: [MessageService],
})
export class UsersListPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly actions$ = inject(Actions);
  private readonly messageService = inject(MessageService);

  users$ = this.store.select(selectUsersData) || [];
  total$ = this.store.select(selectUsersTotal) || 0;
  page$ = this.store.select(selectUsersPage) || 1;
  limit$ = this.store.select(selectUsersLimit) || 10;
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);
  createLoading$ = this.store.select(selectUsersCreateLoading);
  createError$ = this.store.select(selectUsersCreateError);
  createSuccess$ = this.store.select(selectUsersCreateSuccess);
  authUser$ = this.store.select(selectAuthUser);
  selectedUser: UserListItem | null = null;
  showAddDialog = false;

  ngOnInit(): void {
    this.store.dispatch(loadUsers({ page: 1, limit: 10 }));

    this.actions$
      .pipe(ofType(createUserSuccess), takeUntilDestroyed())
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
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => {
        this.showAddDialog = false;
      });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const rows = event.rows ?? 10;
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;
    this.store.dispatch(loadUsers({ page, limit: rows }));
  }

  onRowSelect(event: TableRowSelectEvent<UserListItem>) {
    if (!event.data) {
      return;
    }

    this.router.navigate(['/users', event.data]);
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
}
