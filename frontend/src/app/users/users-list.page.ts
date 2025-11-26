import {
  AsyncPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  TableLazyLoadEvent,
  TableModule,
  TableRowSelectEvent,
} from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { loadUsers } from './state/users.actions';
import {
  selectUsersData,
  selectUsersError,
  selectUsersLimit,
  selectUsersLoading,
  selectUsersPage,
  selectUsersTotal,
} from './state/users.selectors';
import { UserListItem } from './state/users.models';

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
        <button
          pButton
          type="button"
          label="Add User"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="onAddUser()"
        ></button>
      </header>

      <p-table
        [value]="(users$ | async) || []"
        [lazy]="true"
        [paginator]="true"
        [rows]="(limit$ | async) || 10"
        [totalRecords]="(total$ | async) || 0"
        [loading]="loading$ | async"
        [first]="((page$ | async)! - 1) * ((limit$ | async) || 10)"
        (onLazyLoad)="onLazyLoad($event)"
        selectionMode="single"
        dataKey="id"
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
          <tr pSelectableRow [pSelectableRowDisabled]="false">
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

      @if (error$ | async) {
      <p class="error">{{ error$ }}</p>
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
    AsyncPipe,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
  ],
})
export class UsersListPage implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  users$ = this.store.select(selectUsersData) || [];
  total$ = this.store.select(selectUsersTotal) || 0;
  page$ = this.store.select(selectUsersPage) || 1;
  limit$ = this.store.select(selectUsersLimit) || 10;
  loading$ = this.store.select(selectUsersLoading);
  error$ = this.store.select(selectUsersError);

  ngOnInit(): void {
    this.store.dispatch(loadUsers({ page: 1, limit: 10 }));
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

    const user = Array.isArray(event.data) ? event.data[0] : event.data;

    this.router.navigate(['/users', user.id]);
  }

  onAddUser() {
    // Placeholder for future add-user modal workflow.
  }
}
