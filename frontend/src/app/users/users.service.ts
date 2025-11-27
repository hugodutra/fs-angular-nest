import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserListItem, UsersFilters } from './state/users.models';

export interface UsersListResponse {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  list(args: {
    page?: number;
    limit?: number;
    filters?: UsersFilters;
  }): Observable<UsersListResponse> {
    const params = this.buildParams(args);
    return this.http.get<UsersListResponse>('/api/users', { params });
  }

  private buildParams(args: {
    page?: number;
    limit?: number;
    filters?: UsersFilters;
  }) {
    let params = new HttpParams();
    const { page, limit, filters } = args;
    if (page) params = params.set('page', page);
    if (limit) params = params.set('limit', limit);
    if (filters?.email) params = params.set('email', filters.email);
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.role) params = params.set('role', filters.role);
    return params;
  }

  create(payload: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user';
    password: string;
    jobTitle?: string | null;
    bio?: string | null;
    isActive?: boolean;
  }): Observable<UserListItem> {
    return this.http.post<UserListItem>('/api/users', payload);
  }

  update(
    id: string,
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      role: 'admin' | 'user';
      jobTitle?: string | null;
      bio?: string | null;
      isActive?: boolean;
    }
  ): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`/api/users/${id}`, payload);
  }
}
