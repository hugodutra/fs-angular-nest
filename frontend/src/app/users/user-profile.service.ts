import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserListItem } from './state/users.models';

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'user';
  jobTitle?: string | null;
  bio?: string | null;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);

  getUser(id: string): Observable<UserListItem> {
    return this.http.get<UserListItem>(`/api/users/${id}`);
  }

  updateUser(id: string, payload: UpdateUserPayload): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`/api/users/${id}`, payload);
  }
}
