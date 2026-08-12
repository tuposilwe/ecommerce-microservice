import { apiClient } from './client';
import type { ProductDto } from '../types';

export async function getProducts(categoryId?: number): Promise<ProductDto[]> {
  const { data } = await apiClient.get<ProductDto[]>('/products', {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}

export async function createProduct(product: ProductDto): Promise<ProductDto> {
  const { data } = await apiClient.post<ProductDto>('/products', product);
  return data;
}

export async function updateProduct(id: number, product: ProductDto): Promise<ProductDto> {
  const { data } = await apiClient.put<ProductDto>(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function uploadProductImage(id: number, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await apiClient.post(`/products/${id}/image`, formData);
}

export async function deleteProductImage(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}/image`);
}
