import { apiClient } from './client';
import type { Role, UserDto } from '../types';

export async function getUsers(): Promise<UserDto[]> {
  const { data } = await apiClient.get<UserDto[]>('/users');
  return data;
}

export async function updateUserRole(userId: number, role: Role): Promise<UserDto> {
  const { data } = await apiClient.put<UserDto>(`/users/${userId}/role`, { role });
  return data;
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
