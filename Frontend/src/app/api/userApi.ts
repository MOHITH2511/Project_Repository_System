import { apiRequest } from './client';
import type { AuthUser, UserRole } from './types';

export function listUsers(): Promise<AuthUser[]> {
  return apiRequest<AuthUser[]>('/users', {
    method: 'GET',
  });
}

export function updateUserRole(userId: number, role: UserRole): Promise<AuthUser> {
  return apiRequest<AuthUser>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function updateUserActive(userId: number, active: boolean): Promise<AuthUser> {
  return apiRequest<AuthUser>(`/users/${userId}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

export function searchUsers(role?: UserRole, query?: string): Promise<AuthUser[]> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (query && query.trim()) params.set('query', query.trim());

  const search = params.toString();
  const path = search ? `/users/search?${search}` : '/users/search';

  return apiRequest<AuthUser[]>(path, {
    method: 'GET',
  });
}

export function getUserProjectCounts(userIds: number[]): Promise<Record<string, number>> {
  const params = new URLSearchParams();
  userIds.forEach((userId) => params.append('userIds', String(userId)));

  return apiRequest<Record<string, number>>(`/users/project-counts?${params.toString()}`, {
    method: 'GET',
  });
}
