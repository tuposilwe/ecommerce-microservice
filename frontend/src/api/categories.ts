import { apiClient } from './client';
import type { CategoryDto } from '../types';

export async function getCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>('/categories');
  return data;
}

export async function createCategory(name: string): Promise<CategoryDto> {
  const { data } = await apiClient.post<CategoryDto>('/categories', { name });
  return data;
}

export async function updateCategory(id: number, name: string): Promise<CategoryDto> {
  const { data } = await apiClient.put<CategoryDto>(`/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
