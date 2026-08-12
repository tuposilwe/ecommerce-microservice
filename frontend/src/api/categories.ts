import { apiClient } from './client';
import type { CategoryDto } from '../types';

export async function getCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>('/categories');
  return data;
}
