import { apiClient } from './client';
import type { CheckoutResponse } from '../types';

export async function checkout(cartId: string): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>('/checkout', { cartId });
  return data;
}
