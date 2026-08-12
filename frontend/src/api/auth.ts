import { apiClient } from './client';
import type { UserDto } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function login(request: LoginRequest): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/auth/login', request);
  return data.token;
}

export async function register(request: RegisterRequest): Promise<UserDto> {
  const { data } = await apiClient.post<UserDto>('/users', request);
  return data;
}
