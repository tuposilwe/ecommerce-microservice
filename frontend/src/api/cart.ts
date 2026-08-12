import { apiClient } from './client';
import type { CartDto, CartItemDto } from '../types';

export async function createCart(): Promise<CartDto> {
  const { data } = await apiClient.post<CartDto>('/carts');
  return data;
}

export async function getCart(cartId: string): Promise<CartDto> {
  const { data } = await apiClient.get<CartDto>(`/carts/${cartId}`);
  return data;
}

export async function addToCart(cartId: string, productId: number): Promise<CartItemDto> {
  const { data } = await apiClient.post<CartItemDto>(`/carts/${cartId}/items`, { productId });
  return data;
}

export async function updateCartItem(
  cartId: string,
  productId: number,
  quantity: number
): Promise<CartItemDto> {
  const { data } = await apiClient.put<CartItemDto>(`/carts/${cartId}/items/${productId}`, {
    quantity,
  });
  return data;
}

export async function removeCartItem(cartId: string, productId: number): Promise<void> {
  await apiClient.delete(`/carts/${cartId}/items/${productId}`);
}

export async function clearCart(cartId: string): Promise<void> {
  await apiClient.delete(`/carts/${cartId}/items`);
}
