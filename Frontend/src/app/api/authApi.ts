import { apiRequest } from './client';
import type { AuthResponse, AuthUser, LoginRequest } from './types';

export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    { skipAuth: true }
  );
}

export function register(payload: {
  name: string;
  email: string;
  password: string;
  role: 'CONTRIBUTOR' | 'REVIEWER' | 'ADMIN';
  department: string;
}): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    { skipAuth: true }
  );
}

export function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', { method: 'GET' });
}
