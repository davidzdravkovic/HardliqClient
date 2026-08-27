import { request } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/domain/auth';

export function register(body: RegisterRequest) {
  return request<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    { useAuth: false },
  );
}

export function login(body : LoginRequest) {
  return request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    { useAuth: false },
  );
}
