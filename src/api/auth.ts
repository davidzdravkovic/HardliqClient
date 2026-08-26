import { request } from './client';
import type { AuthResponse } from '../types/auth';

export function register(username: string, email: string, password: string) {
  return request<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    },
    { useAuth: false },
  );
}

export function login(username: string, password: string) {
  return request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    { useAuth: false },
  );
}
