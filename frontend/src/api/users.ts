import { apiClient } from './client';
import type { PageResponse, Role, SortDirection, UserDto } from '../types';

export interface UsersQuery {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  direction?: SortDirection;
}

export async function getUsers(query: UsersQuery = {}): Promise<PageResponse<UserDto>> {
  const { data } = await apiClient.get<PageResponse<UserDto>>('/users', { params: query });
  return data;
}

// For joins that need the whole user list (e.g. mapping customerId -> name).
export async function getAllUserNames(): Promise<Map<number, string>> {
  const { content } = await getUsers({ size: 100 });
  return new Map(content.map((u) => [u.user_id, u.name]));
}

export async function updateUserRole(userId: number, role: Role): Promise<UserDto> {
  const { data } = await apiClient.put<UserDto>(`/users/${userId}/role`, { role });
  return data;
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
