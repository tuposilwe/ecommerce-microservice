import { apiClient } from './client';
import type { CheckoutResponse, OrderDto } from '../types';

export async function getOrders(): Promise<OrderDto[]> {
  const { data } = await apiClient.get<OrderDto[]>('/orders');
  return data;
}

export async function getOrder(orderId: number): Promise<OrderDto> {
  const { data } = await apiClient.get<OrderDto>(`/orders/${orderId}`);
  return data;
}

export async function checkoutOrder(orderId: number): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>(`/orders/${orderId}/checkout`);
  return data;
}

export async function getAdminOrders(): Promise<OrderDto[]> {
  const { data } = await apiClient.get<OrderDto[]>('/orders/admin');
  return data;
}
