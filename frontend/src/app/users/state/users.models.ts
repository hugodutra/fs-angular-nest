export type UserRole = 'admin' | 'user';

export interface UsersFilters {
  email?: string;
  name?: string;
  role?: UserRole;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  bio: string | null;
  isActive: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UsersState {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  filters: UsersFilters;
}
